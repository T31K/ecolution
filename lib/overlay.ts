import type { AppStatus, Application, Job } from "./types";

export type Session = { userId: string; role: "seeker" | "poster" };

export type Overlay = {
  applications: Application[];
  listings: Job[];
  statusPatches: Record<string, AppStatus>;
  session: Session | null;
};

export const EMPTY_OVERLAY: Overlay = {
  applications: [],
  listings: [],
  statusPatches: {},
  session: null,
};

/** Seeded first, overlay appended, then status patches applied over both. */
export function mergeApplications(
  seeded: Application[],
  overlay: Overlay,
): Application[] {
  return [...seeded, ...overlay.applications].map((application) => {
    const patched = overlay.statusPatches[application.id];
    return patched ? { ...application, status: patched } : application;
  });
}

/** Newly posted listings surface first so the poster sees their own work. */
export function mergeJobs(seeded: Job[], overlay: Overlay): Job[] {
  return [...overlay.listings, ...seeded];
}

export function addApplication(
  overlay: Overlay,
  application: Application,
): Overlay {
  return { ...overlay, applications: [...overlay.applications, application] };
}

export function setStatus(
  overlay: Overlay,
  applicationId: string,
  status: AppStatus,
): Overlay {
  return {
    ...overlay,
    statusPatches: { ...overlay.statusPatches, [applicationId]: status },
  };
}

export function addListing(overlay: Overlay, job: Job): Overlay {
  return { ...overlay, listings: [...overlay.listings, job] };
}

export function hasApplied(
  applications: Application[],
  seekerId: string,
  jobId: string,
): boolean {
  return applications.some(
    (application) =>
      application.seekerId === seekerId && application.jobId === jobId,
  );
}
