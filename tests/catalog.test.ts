import { describe, expect, it } from "vitest";
import {
  CITIES,
  COMPANIES,
  ROLE_TEMPLATES,
  SENIORITY_MULTIPLIER,
} from "@/scripts/seed/catalog";

describe("catalog", () => {
  it("has exactly 10 companies with unique ids", () => {
    expect(COMPANIES).toHaveLength(10);
    const ids = new Set(COMPANIES.map((company) => company.id));
    expect(ids.size).toBe(10);
  });

  it("distributes listings unevenly", () => {
    const shares = COMPANIES.map((company) => company.listingShare);
    expect(Math.max(...shares)).toBeGreaterThan(Math.min(...shares) * 3);
  });

  it("gives every city a positive base salary and a currency", () => {
    for (const city of CITIES) {
      expect(city.baseSalary).toBeGreaterThan(0);
      expect(["USD", "EUR", "GBP"]).toContain(city.currency);
      expect(city.country).toHaveLength(2);
    }
  });

  it("gives every role template real responsibilities and requirements", () => {
    for (const role of ROLE_TEMPLATES) {
      expect(role.responsibilities.length).toBeGreaterThanOrEqual(3);
      expect(role.requirements.length).toBeGreaterThanOrEqual(3);
      expect(role.impactAreas.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("orders seniority multipliers monotonically", () => {
    expect(SENIORITY_MULTIPLIER.intern).toBeLessThan(SENIORITY_MULTIPLIER.junior);
    expect(SENIORITY_MULTIPLIER.junior).toBeLessThan(SENIORITY_MULTIPLIER.mid);
    expect(SENIORITY_MULTIPLIER.mid).toBeLessThan(SENIORITY_MULTIPLIER.senior);
    expect(SENIORITY_MULTIPLIER.senior).toBeLessThan(SENIORITY_MULTIPLIER.staff);
    expect(SENIORITY_MULTIPLIER.staff).toBeLessThan(SENIORITY_MULTIPLIER.director);
  });

  it("covers enough role templates for varied listings", () => {
    expect(ROLE_TEMPLATES.length).toBeGreaterThanOrEqual(12);
  });
});
