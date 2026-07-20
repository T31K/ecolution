"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";

const ROLE_TYPES = [
  "Engineering",
  "Data Science",
  "Product Management",
  "Sustainability Policy",
];

const IMPACT_AREAS = [
  "Renewable Energy",
  "Carbon Removal",
  "Circular Economy",
  "Water Systems",
];

const SALARY_MIN = 40000;
const SALARY_MAX = 300000;

export function BrowseFilters() {
  const [roles, setRoles] = useState<string[]>(["Engineering"]);
  const [areas, setAreas] = useState<string[]>(["Renewable Energy"]);
  const [location, setLocation] = useState("");
  const [salary, setSalary] = useState(120000);

  const toggle = (
    value: string,
    list: string[],
    setList: (next: string[]) => void,
  ) =>
    setList(
      list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
    );

  const clearAll = () => {
    setRoles([]);
    setAreas([]);
    setLocation("");
    setSalary(120000);
  };

  return (
    <aside className="w-full shrink-0 lg:w-72">
      <div className="sticky top-24 rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-headline-md text-on-surface">
            Filters
          </h2>
          <button
            onClick={clearAll}
            className="text-label-sm text-secondary hover:underline"
          >
            Clear all
          </button>
        </div>

        <fieldset className="mb-6">
          <legend className="mb-3 block text-label-md text-on-surface">
            Role Type
          </legend>
          <div className="space-y-2">
            {ROLE_TYPES.map((role) => {
              const checked = roles.includes(role);
              return (
                <label
                  key={role}
                  className="group flex cursor-pointer items-center gap-3"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(role, roles, setRoles)}
                    className="h-5 w-5 rounded border-outline accent-secondary"
                  />
                  <span
                    className={
                      checked
                        ? "text-body-sm font-semibold text-secondary"
                        : "text-body-sm text-on-surface-variant group-hover:text-secondary"
                    }
                  >
                    {role}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="mb-6">
          <label
            htmlFor="filter-location"
            className="mb-3 block text-label-md text-on-surface"
          >
            Location
          </label>
          <div className="relative">
            <MapPin className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-outline" />
            <input
              id="filter-location"
              type="text"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="City or Remote"
              className="w-full rounded-lg border border-outline-variant py-2 pr-4 pl-10 text-body-sm focus:border-secondary focus:ring-2 focus:ring-secondary/20 focus:outline-none"
            />
          </div>
        </div>

        <div className="mb-6">
          <label
            htmlFor="filter-salary"
            className="mb-3 block text-label-md text-on-surface"
          >
            Salary Range (USD)
          </label>
          <input
            id="filter-salary"
            type="range"
            min={SALARY_MIN}
            max={SALARY_MAX}
            step={5000}
            value={salary}
            onChange={(event) => setSalary(Number(event.target.value))}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-surface-container-highest accent-secondary"
          />
          <div className="mt-2 flex justify-between">
            <span className="text-label-sm text-on-surface-variant">$40k</span>
            <span className="text-label-sm font-semibold text-secondary">
              ${Math.round(salary / 1000)}k
            </span>
            <span className="text-label-sm text-on-surface-variant">$300k+</span>
          </div>
        </div>

        <div>
          <span className="mb-3 block text-label-md text-on-surface">
            Impact Area
          </span>
          <div className="flex flex-wrap gap-2">
            {IMPACT_AREAS.map((area) => {
              const active = areas.includes(area);
              return (
                <button
                  key={area}
                  aria-pressed={active}
                  onClick={() => toggle(area, areas, setAreas)}
                  className={
                    active
                      ? "rounded border border-secondary/20 bg-surface-container-highest px-3 py-1.5 text-label-sm text-secondary"
                      : "rounded border border-outline-variant/30 bg-surface-container-low px-3 py-1.5 text-label-sm text-on-surface-variant hover:border-secondary/50"
                  }
                >
                  {area}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
