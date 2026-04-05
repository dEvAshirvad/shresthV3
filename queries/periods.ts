import {
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";

import { api } from "@/lib/axios";
import type { ApiSuccessEnvelope } from "@/queries/departments";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export type KpiPeriodStatus = "active" | "locked" | "closed";

export type KpiPeriodConfig = {
	_id: string;
	organizationId: string;
	frequencyMonths: number;
	lockingPeriodDays: number;
	isStarted: boolean;
	/** Present until `POST /start` runs; cleared after start. */
	pendingStartDate?: string | null;
	startedAt: string | null;
	createdAt: string;
	updatedAt: string;
};

export type KpiPeriodDocument = {
	_id: string;
	organizationId: string;
	frequencyMonths: number;
	key: string;
	name: string;
	startDate: string;
	endDate: string;
	status: KpiPeriodStatus;
	createdAt: string;
	updatedAt: string;
};

export type ListKpiPeriodsQuery = {
	page?: number;
	limit?: number;
	/** Optional filter: `active`, `locked`, or `closed`. */
	status?: KpiPeriodStatus;
};

export type ListKpiPeriodsData = {
	docs: KpiPeriodDocument[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
	message: string;
};

export type ListKpiPeriodsResponse = ApiSuccessEnvelope<ListKpiPeriodsData>;

export type GetKpiPeriodData = {
	period: KpiPeriodDocument;
	message: string;
};

export type GetKpiPeriodResponse = ApiSuccessEnvelope<GetKpiPeriodData>;

export type GetKpiPeriodConfigData = {
	config: KpiPeriodConfig | null;
	message: string;
};

export type GetKpiPeriodConfigResponse = ApiSuccessEnvelope<GetKpiPeriodConfigData>;

export type PeriodsStartData = {
	config: KpiPeriodConfig;
	period: KpiPeriodDocument;
	message: string;
};

export type PeriodsStartResponse = ApiSuccessEnvelope<PeriodsStartData>;

/**
 * Before `POST /start`: every `PUT /config` must send all three fields.
 * After start: only `frequencyMonths` and `lockingPeriodDays` (when latest period is `locked`); do not send `startDate`.
 */
export type KpiPeriodConfigPutBody = {
	frequencyMonths: number;
	lockingPeriodDays: number;
	/**
	 * Anchor for the first period. Omit after system has started.
	 * Client may send full ISO UTC (e.g. noon on an India business day — see `lib/business-date.ts`).
	 */
	startDate?: string;
};

export type PeriodsConfigUpdateData = {
	config: KpiPeriodConfig;
	message: string;
};

export type PeriodsConfigUpdateResponse = ApiSuccessEnvelope<PeriodsConfigUpdateData>;

export type UpdatePeriodEndDateBody = {
	periodId: string;
	endDate: string;
};

export type UpdatePeriodEndDateData = {
	period: KpiPeriodDocument;
	message: string;
};

export type UpdatePeriodEndDateResponse = ApiSuccessEnvelope<UpdatePeriodEndDateData>;

/** At least one of `startDate` or `endDate` required. Active period only. */
export type UpdatePeriodDatesBody = {
	periodId: string;
	startDate?: string;
	endDate?: string;
};

export type UpdatePeriodDatesData = {
	period: KpiPeriodDocument;
	message: string;
};

export type UpdatePeriodDatesResponse = ApiSuccessEnvelope<UpdatePeriodDatesData>;

export type ForceLockBody = {
	periodId: string;
};

export type ForceLockData = {
	closedPeriod: KpiPeriodDocument;
	nextPeriod: KpiPeriodDocument;
	message: string;
};

export type ForceLockResponse = ApiSuccessEnvelope<ForceLockData>;

export type GeneratePeriodReportsBody = {
	periodId: string;
	force?: boolean;
};

export type GeneratePeriodReportsData = {
	run: unknown;
	message: string;
};

export type GeneratePeriodReportsResponse =
	ApiSuccessEnvelope<GeneratePeriodReportsData>;

const BASE = "/api/v1/periods";

// ──────────────────────────────────────────────
// Query keys
// ──────────────────────────────────────────────

export const periodKeys = {
	all: ["periods"] as const,
	config: () => [...periodKeys.all, "config"] as const,
	list: (params: ListKpiPeriodsQuery) =>
		[...periodKeys.all, "list", params] as const,
	detail: (id: string) => [...periodKeys.all, "detail", id] as const,
};

// ──────────────────────────────────────────────
// API functions
// ──────────────────────────────────────────────

/** Paginated periods for the active org (newest `startDate` first). */
export async function listKpiPeriods(
	params: ListKpiPeriodsQuery = {},
): Promise<ListKpiPeriodsResponse> {
	const { data } = await api.get<ListKpiPeriodsResponse>(BASE, { params });
	return data;
}

/** Single period when `_id` belongs to the active org. */
export async function getKpiPeriod(id: string): Promise<GetKpiPeriodResponse> {
	const { data } = await api.get<GetKpiPeriodResponse>(`${BASE}/${id}`);
	return data;
}

/** Org KPI period settings row; `config` is null if never saved. */
export async function getKpiPeriodConfig(): Promise<GetKpiPeriodConfigResponse> {
	const { data } = await api.get<GetKpiPeriodConfigResponse>(`${BASE}/config`);
	return data;
}

/** One-time: start automation and create the first period from the configured anchor `startDate`. */
export async function startKpiPeriods(): Promise<PeriodsStartResponse> {
	const { data } = await api.post<PeriodsStartResponse>(`${BASE}/start`, {});
	return data;
}

/** Create or update org KPI period settings (see `KpiPeriodConfigPutBody`). */
export async function updateKpiPeriodConfig(
	body: KpiPeriodConfigPutBody,
): Promise<PeriodsConfigUpdateResponse> {
	const { data } = await api.put<PeriodsConfigUpdateResponse>(
		`${BASE}/config`,
		body,
	);
	return data;
}

/** Org admin: change the active period’s inclusive `endDate`. */
export async function updateKpiPeriodEndDate(
	body: UpdatePeriodEndDateBody,
): Promise<UpdatePeriodEndDateResponse> {
	const { data } = await api.post<UpdatePeriodEndDateResponse>(
		`${BASE}/admin/update-end-date`,
		body,
	);
	return data;
}

/** Org admin: adjust `startDate` and/or `endDate` on the active period (preferred over update-end-date). */
export async function updateKpiPeriodDates(
	body: UpdatePeriodDatesBody,
): Promise<UpdatePeriodDatesResponse> {
	const { data } = await api.post<UpdatePeriodDatesResponse>(
		`${BASE}/admin/update-period-dates`,
		body,
	);
	return data;
}

/** Org admin: lock → reports → close → roll to next active period. */
export async function forceLockKpiPeriod(
	body: ForceLockBody,
): Promise<ForceLockResponse> {
	const { data } = await api.post<ForceLockResponse>(
		`${BASE}/admin/force-lock`,
		body,
	);
	return data;
}

/** Org admin: generate or retry report snapshot for a locked/closed period. */
export async function generateKpiPeriodReports(
	body: GeneratePeriodReportsBody,
): Promise<GeneratePeriodReportsResponse> {
	const { data } = await api.post<GeneratePeriodReportsResponse>(
		`${BASE}/admin/generate-reports`,
		body,
	);
	return data;
}

// ──────────────────────────────────────────────
// React Query hooks
// ──────────────────────────────────────────────

export function useListKpiPeriods(params: ListKpiPeriodsQuery = {}) {
	return useQuery({
		queryKey: periodKeys.list(params),
		queryFn: () => listKpiPeriods(params),
	});
}

export function useKpiPeriod(id: string) {
	return useQuery({
		queryKey: periodKeys.detail(id),
		queryFn: () => getKpiPeriod(id),
		enabled: !!id,
	});
}

export function useKpiPeriodConfig(enabled = true) {
	return useQuery({
		queryKey: periodKeys.config(),
		queryFn: () => getKpiPeriodConfig(),
		enabled,
	});
}

export function useStartKpiPeriods() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: startKpiPeriods,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: periodKeys.all });
			queryClient.invalidateQueries({ queryKey: periodKeys.config() });
		},
	});
}

export function useUpdateKpiPeriodConfig() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: updateKpiPeriodConfig,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: periodKeys.all });
			queryClient.invalidateQueries({ queryKey: periodKeys.config() });
		},
	});
}

export function useUpdateKpiPeriodEndDate() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: updateKpiPeriodEndDate,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: periodKeys.all });
		},
	});
}

export function useUpdateKpiPeriodDates() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: updateKpiPeriodDates,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: periodKeys.all });
		},
	});
}

export function useForceLockKpiPeriod() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: forceLockKpiPeriod,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: periodKeys.all });
		},
	});
}

export function useGenerateKpiPeriodReports() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: generateKpiPeriodReports,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: periodKeys.all });
		},
	});
}
