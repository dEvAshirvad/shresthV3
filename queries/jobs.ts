import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/axios";
import type { ApiSuccessEnvelope } from "@/queries/departments";

// ──────────────────────────────────────────────
// Types — GET /api/v1/jobs/:jobId (BullMQ)
// ──────────────────────────────────────────────

export type BullMqJobState =
	| "waiting"
	| "active"
	| "completed"
	| "failed"
	| "delayed"
	| "paused";

export type BullMqJob = {
	state: BullMqJobState;
	returnvalue?: unknown;
	failedReason?: string;
	finishedOn?: number;
	processedOn?: number;
	timestamp?: number;
};

export type GetJobData = {
	job: BullMqJob;
	message?: string;
};

export type GetJobResponse = ApiSuccessEnvelope<GetJobData>;

const BASE = "/api/v1/jobs";

// ──────────────────────────────────────────────
// Query keys
// ──────────────────────────────────────────────

export const jobKeys = {
	all: ["jobs"] as const,
	detail: (id: string) => [...jobKeys.all, id] as const,
};

// ──────────────────────────────────────────────
// API
// ──────────────────────────────────────────────

/** BullMQ job metadata when the job belongs to the active org (owner/admin/nodal). */
export async function getJob(jobId: string): Promise<GetJobResponse> {
	const { data } = await api.get<GetJobResponse>(`${BASE}/${jobId}`);
	return data;
}

// ──────────────────────────────────────────────
// React Query
// ──────────────────────────────────────────────

type UseJobOptions = {
	enabled?: boolean;
	/** Poll while job is not terminal. Default 2000 ms. */
	pollIntervalMs?: number;
};

/**
 * Polls job status until `completed` or `failed` (or other terminal states you treat as done).
 */
export function useJob(jobId: string | null, options: UseJobOptions = {}) {
	const { enabled = true, pollIntervalMs = 2000 } = options;
	const terminal = new Set<BullMqJobState>(["completed", "failed"]);

	return useQuery({
		queryKey: jobKeys.detail(jobId ?? ""),
		queryFn: () => getJob(jobId!),
		enabled: !!jobId && enabled,
		refetchInterval: (query) => {
			const state = query.state.data?.data?.job?.state;
			if (!state || terminal.has(state)) return false;
			return pollIntervalMs;
		},
	});
}
