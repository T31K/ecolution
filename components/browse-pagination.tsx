"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { filtersToQuery, parseFilters } from "@/lib/filters";

/** A short window around the current page, always including first and last. */
function pageWindow(current: number, total: number): (number | "gap")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, total, current]);
  if (current - 1 > 1) pages.add(current - 1);
  if (current + 1 < total) pages.add(current + 1);

  const sorted = [...pages].sort((a, b) => a - b);
  const result: (number | "gap")[] = [];
  let previous = 0;
  for (const page of sorted) {
    if (previous && page - previous > 1) result.push("gap");
    result.push(page);
    previous = page;
  }
  return result;
}

export function BrowsePagination({
  current = 1,
  totalPages = 1,
}: {
  current?: number;
  totalPages?: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filters = parseFilters(Object.fromEntries(searchParams.entries()));

  const goTo = (page: number) => {
    const query = filtersToQuery({ ...filters, page });
    router.push(query ? `/browse?${query}` : "/browse", { scroll: true });
  };

  return (
    <nav
      aria-label="Pagination"
      className="mt-stack-lg flex items-center justify-center gap-4"
    >
      <Button
        variant="outline"
        size="icon-lg"
        aria-label="Previous page"
        disabled={current === 1}
        onClick={() => goTo(current - 1)}
        className="rounded-full border-outline-variant hover:border-secondary hover:text-secondary"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      <div className="flex items-center gap-2">
        {pageWindow(current, totalPages).map((page, index) =>
          page === "gap" ? (
            <span key={`gap-${index}`} className="text-outline">
              …
            </span>
          ) : (
            <Button
              key={page}
              variant={page === current ? "brand" : "ghost"}
              size="icon-lg"
              aria-current={page === current ? "page" : undefined}
              onClick={() => goTo(page)}
              className="rounded-full"
            >
              {page}
            </Button>
          ),
        )}
      </div>

      <Button
        variant="outline"
        size="icon-lg"
        aria-label="Next page"
        disabled={current === totalPages}
        onClick={() => goTo(current + 1)}
        className="rounded-full border-outline-variant hover:border-secondary hover:text-secondary"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </nav>
  );
}
