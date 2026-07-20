import type { AppStatus } from "./types";

export const STATUS_LABELS: Record<AppStatus, string> = {
  new: "New",
  reviewing: "Reviewing",
  interviewing: "Interviewing",
  rejected: "Not progressing",
  offer: "Offer",
};

/**
 * Shared by the seeker's application list and the poster's applicant table so
 * a status always reads the same colour on both sides of the round trip.
 */
export const STATUS_STYLES: Record<AppStatus, string> = {
  new: "bg-secondary-container/50 text-on-secondary-container",
  reviewing: "bg-surface-container-high text-on-surface-variant",
  interviewing: "bg-secondary text-on-secondary",
  rejected: "bg-error-container text-error",
  offer: "bg-primary-container text-on-primary",
};

export const STATUS_ORDER: AppStatus[] = [
  "new",
  "reviewing",
  "interviewing",
  "offer",
  "rejected",
];
