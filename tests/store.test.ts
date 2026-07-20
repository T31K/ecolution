// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  STORAGE_KEY,
  readOverlay,
  resetOverlay,
  writeOverlay,
} from "@/lib/store";
import { EMPTY_OVERLAY, addApplication } from "@/lib/overlay";
import type { Application } from "@/lib/types";

const application: Application = {
  id: "app-1",
  jobId: "job-1",
  seekerId: "seeker-0",
  status: "new",
  coverNote: "hello",
  appliedAt: "2026-07-20T00:00:00Z",
};

describe("store", () => {
  beforeEach(() => {
    localStorage.clear();
    resetOverlay();
  });

  it("returns an empty overlay when nothing is stored", () => {
    expect(readOverlay()).toEqual(EMPTY_OVERLAY);
  });

  it("round-trips an overlay", () => {
    writeOverlay(addApplication(EMPTY_OVERLAY, application));
    expect(readOverlay().applications).toHaveLength(1);
    expect(readOverlay().applications[0].id).toBe("app-1");
  });

  it("clears stored state on reset", () => {
    writeOverlay(addApplication(EMPTY_OVERLAY, application));
    resetOverlay();
    expect(readOverlay()).toEqual(EMPTY_OVERLAY);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("falls back to empty when stored JSON is corrupt", () => {
    localStorage.setItem(STORAGE_KEY, "{not json");
    expect(readOverlay()).toEqual(EMPTY_OVERLAY);
  });

  it("falls back to empty when stored JSON has the wrong shape", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ nonsense: true }));
    expect(readOverlay()).toEqual(EMPTY_OVERLAY);
  });

  it("does not throw when storage writes fail", () => {
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });
    expect(() => writeOverlay(EMPTY_OVERLAY)).not.toThrow();
    spy.mockRestore();
  });
});
