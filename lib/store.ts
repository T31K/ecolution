"use client";

import { useCallback, useSyncExternalStore } from "react";
import { EMPTY_OVERLAY, type Overlay } from "./overlay";

export const STORAGE_KEY = "ecolution:demo:v1";

/**
 * Used when localStorage is unavailable (private mode) or throws on write.
 * The demo keeps working for the session; state simply does not survive a
 * reload, which beats crashing in front of a client.
 */
let memoryFallback: Overlay = EMPTY_OVERLAY;

function isOverlay(value: unknown): value is Overlay {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<Overlay>;
  return (
    Array.isArray(candidate.applications) &&
    Array.isArray(candidate.listings) &&
    typeof candidate.statusPatches === "object" &&
    candidate.statusPatches !== null
  );
}

export function readOverlay(): Overlay {
  if (typeof window === "undefined") return EMPTY_OVERLAY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return memoryFallback;
    const parsed: unknown = JSON.parse(raw);
    return isOverlay(parsed) ? parsed : EMPTY_OVERLAY;
  } catch {
    return memoryFallback;
  }
}

export function writeOverlay(overlay: Overlay): void {
  memoryFallback = overlay;
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(overlay));
  } catch {
    // Quota or private mode — memoryFallback already holds the value.
  }
}

export function resetOverlay(): void {
  memoryFallback = EMPTY_OVERLAY;
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to do; memoryFallback is already reset.
  }
}

// --- external store plumbing -------------------------------------------------
// useSyncExternalStore rather than setState-in-effect: it keeps server and
// first client render agreeing (both see EMPTY_OVERLAY), hydrates on subscribe,
// and satisfies react-hooks/set-state-in-effect.

const listeners = new Set<() => void>();
let snapshot: Overlay = EMPTY_OVERLAY;
let hydrated = false;

function emit() {
  for (const listener of listeners) listener();
}

/** Kept in sync so getSnapshot stays referentially stable between renders. */
function commit(overlay: Overlay) {
  snapshot = overlay;
  writeOverlay(overlay);
  emit();
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);

  // First subscriber pulls the persisted overlay in. React calls subscribe
  // after mount, so this never runs during render.
  if (!hydrated) {
    hydrated = true;
    snapshot = readOverlay();
    onChange();
  }

  // Keep multiple tabs of the demo consistent with each other.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    snapshot = readOverlay();
    emit();
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

const getSnapshot = (): Overlay => snapshot;
const getServerSnapshot = (): Overlay => EMPTY_OVERLAY;

export function useOverlay() {
  const overlay = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const update = useCallback((fn: (current: Overlay) => Overlay) => {
    commit(fn(snapshot));
  }, []);

  const reset = useCallback(() => {
    resetOverlay();
    snapshot = EMPTY_OVERLAY;
    emit();
  }, []);

  return { overlay, update, reset };
}
