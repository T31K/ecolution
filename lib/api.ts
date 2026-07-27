import type { AppStatus, Job } from "./types";

/**
 * Client for the decarbon backend (main-server /decarbon routes).
 * Isomorphic: server components pass no token; client components pass the
 * JWT from the session store. All fetches are uncached — listings must be
 * fresh, and this Next version does not cache fetch by default anyway.
 */
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "https://api.kaleidoscopical.com";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type RequestOptions = {
  method?: string;
  token?: string;
  body?: unknown;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (options.token) headers.Authorization = `Bearer ${options.token}`;

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      cache: "no-store",
    });
  } catch {
    throw new ApiError(0, "Could not reach the server. Check your connection and try again.");
  }

  const data = (await res.json().catch(() => ({}))) as { error?: string } & T;
  if (!res.ok) throw new ApiError(res.status, data.error ?? `Request failed (${res.status})`);
  return data;
}

// ── Auth ───────────────────────────────────────────────────────────────────────

export type ApiUser = {
  id: string;
  email: string;
  name: string;
  role: "seeker" | "poster";
  headline: string | null;
  company: string | null;
  companyLogo: string | null;
};

export type AuthResponse = { token: string; user: ApiUser };

export function signup(body: {
  email: string;
  password: string;
  name: string;
  role: "seeker" | "poster";
  headline?: string;
  company?: string;
}): Promise<AuthResponse> {
  return request("/decarbon/signup", { method: "POST", body });
}

export function login(email: string, password: string): Promise<AuthResponse> {
  return request("/decarbon/login", { method: "POST", body: { email, password } });
}

export function me(token: string): Promise<{ user: ApiUser }> {
  return request("/decarbon/me", { token });
}

// ── Jobs ───────────────────────────────────────────────────────────────────────

export type JobListParams = {
  search?: string;
  roleType?: string; // comma-separated list
  seniority?: string;
  impactArea?: string;
  country?: string;
  remote?: boolean;
  salaryMin?: number;
  source?: string;
  sort?: "newest" | "salary" | "views";
  page?: number;
  perPage?: number;
};

export type JobListResponse = {
  total: number;
  page: number;
  perPage: number;
  jobs: Job[];
};

export function listJobs(params: JobListParams = {}): Promise<JobListResponse> {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "" || value === false) continue;
    query.set(key, String(value));
  }
  const qs = query.toString();
  return request(`/decarbon/jobs${qs ? `?${qs}` : ""}`);
}

export async function getJob(id: string): Promise<Job | null> {
  try {
    const { job } = await request<{ job: Job }>(`/decarbon/jobs/${encodeURIComponent(id)}`);
    return job;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export function createJob(
  token: string,
  body: {
    title: string;
    company: string;
    salaryMin?: number;
    salaryMax?: number;
    currency?: string;
    city?: string;
    country?: string;
    remote?: boolean;
    roleType?: string;
    seniority?: string;
    impactArea?: string;
    detail?: Record<string, unknown>;
  },
): Promise<{ job: Job }> {
  return request("/decarbon/jobs", { method: "POST", token, body });
}

// ── Applications ───────────────────────────────────────────────────────────────

export type MyApplication = {
  id: string;
  jobId: string;
  status: AppStatus;
  coverNote: string;
  appliedAt: string;
  job: {
    id: string;
    title: string;
    company: string;
    companyLogo: string;
    salaryDisplay: string;
    locationDisplay: string;
  };
};

export function applyToJob(
  token: string,
  jobId: string,
  coverNote: string,
): Promise<{ application: { id: string } }> {
  return request("/decarbon/applications", { method: "POST", token, body: { jobId, coverNote } });
}

export function myApplications(token: string): Promise<{ applications: MyApplication[] }> {
  return request("/decarbon/applications/mine", { token });
}

export function updateApplicationStatus(
  token: string,
  applicationId: string,
  status: AppStatus,
): Promise<{ application: { id: string; status: AppStatus } }> {
  return request(`/decarbon/applications/${encodeURIComponent(applicationId)}`, {
    method: "PATCH",
    token,
    body: { status },
  });
}

// ── Employer ───────────────────────────────────────────────────────────────────

export type EmployerApplication = {
  id: string;
  jobId: string;
  jobTitle: string;
  status: AppStatus;
  coverNote: string;
  appliedAt: string;
  seeker: { name: string; email: string; headline: string | null };
};

export function employerOverview(
  token: string,
): Promise<{ jobs: Job[]; applications: EmployerApplication[] }> {
  return request("/decarbon/employer/overview", { token });
}
