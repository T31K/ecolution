"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { ApiUser } from "./api";

export type ApiSession = { token: string; user: ApiUser };

const SESSION_KEY = "ecolution:session:v2";

/** In-memory fallback for private mode; session just won't survive reload. */
let memoryFallback: ApiSession | null = null;

function isSession(value: unknown): value is ApiSession {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<ApiSession>;
  return typeof candidate.token === "string" && typeof candidate.user === "object";
}

function readSession(): ApiSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return memoryFallback;
    const parsed: unknown = JSON.parse(raw);
    return isSession(parsed) ? parsed : null;
  } catch {
    return memoryFallback;
  }
}

function writeSession(session: ApiSession | null): void {
  memoryFallback = session;
  if (typeof window === "undefined") return;
  try {
    if (session) window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else window.localStorage.removeItem(SESSION_KEY);
  } catch {
    // memoryFallback already holds the value
  }
}

// Same useSyncExternalStore pattern as the old lib/store.ts: server render and
// first client render both see null, then subscribe hydrates from storage.
const listeners = new Set<() => void>();
let snapshot: ApiSession | null = null;
let hydrated = false;

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  if (!hydrated) {
    hydrated = true;
    snapshot = readSession();
    onChange();
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key !== SESSION_KEY) return;
    snapshot = readSession();
    emit();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

const getSnapshot = () => snapshot;
const getServerSnapshot = () => null;

export function useSession() {
  const session = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const signIn = useCallback((next: ApiSession) => {
    snapshot = next;
    writeSession(next);
    emit();
  }, []);

  const signOut = useCallback(() => {
    snapshot = null;
    writeSession(null);
    emit();
  }, []);

  return { session, signIn, signOut };
}
