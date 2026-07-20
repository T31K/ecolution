import { describe, expect, it } from "vitest";
import { createRng } from "@/scripts/seed/rng";

describe("createRng", () => {
  it("produces the same sequence for the same seed", () => {
    const a = createRng(42);
    const b = createRng(42);
    const seqA = [a.next(), a.next(), a.next()];
    const seqB = [b.next(), b.next(), b.next()];
    expect(seqA).toEqual(seqB);
  });

  it("produces a different sequence for a different seed", () => {
    const a = createRng(1);
    const b = createRng(2);
    expect(a.next()).not.toBe(b.next());
  });

  it("returns values in [0, 1)", () => {
    const rng = createRng(7);
    for (let i = 0; i < 200; i++) {
      const value = rng.next();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it("int respects inclusive bounds", () => {
    const rng = createRng(3);
    for (let i = 0; i < 200; i++) {
      const value = rng.int(5, 10);
      expect(value).toBeGreaterThanOrEqual(5);
      expect(value).toBeLessThanOrEqual(10);
      expect(Number.isInteger(value)).toBe(true);
    }
  });

  it("pick returns a member of the input", () => {
    const rng = createRng(9);
    const items = ["a", "b", "c"] as const;
    for (let i = 0; i < 50; i++) {
      expect(items).toContain(rng.pick(items));
    }
  });

  it("weighted honours relative weights", () => {
    const rng = createRng(11);
    const counts = { common: 0, rare: 0 };
    for (let i = 0; i < 1000; i++) {
      counts[rng.weighted([["common", 9], ["rare", 1]] as const)]++;
    }
    expect(counts.common).toBeGreaterThan(counts.rare * 3);
  });

  it("shuffle preserves membership and does not mutate the input", () => {
    const rng = createRng(13);
    const input = [1, 2, 3, 4, 5];
    const output = rng.shuffle(input);
    expect(output).toHaveLength(5);
    expect([...output].sort()).toEqual([1, 2, 3, 4, 5]);
    expect(input).toEqual([1, 2, 3, 4, 5]);
  });
});
