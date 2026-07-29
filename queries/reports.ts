import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { ApiSuccessEnvelope } from "@/queries/departments";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export type ReportRunStatus = string;

export type ReportRun = {
	_id: string;
	organizationId: string;
	periodId: string;
	periodKey: string;
	generatedAt: string;
	status: ReportRunStatus;
	createdAt: string;
	updatedAt: string;
};

export type ListReportRunsData = {
	reports: ReportRun[];
	message: string;
};

export type ListReportRunsResponse = ApiSuccessEnvelope<ListReportRunsData>;

export type ReportSummaryData = {
	run: ReportRun | null;
	message: string;
};

export type ReportSummaryResponse = ApiSuccessEnvelope<ReportSummaryData>;

export type ReportDepartmentRole = {
	_id?: string;
	departmentId: string;
	role: string;
	employees?: number;
	avgObtainedMarks?: number;
	totalObtainedMarks?: number;
	totalMarks?: number;
	createdAt?: string;
	updatedAt?: string;
	[key: string]: unknown;
};

export type DepartmentRoleStatsQuery = {
	departmentId?: string;
};

export type DepartmentRoleStatsData = {
	stats: ReportDepartmentRole[];
	message: string;
};

export type DepartmentRoleStatsResponse =
	ApiSuccessEnvelope<DepartmentRoleStatsData>;

export type RankingScope = "overall" | "department";

export type ReportRankingRow = {
	scope?: string;
	employeeId: string;
	employeeName: string;
	departmentId: string;
	role: string;
	obtainedMarks: number;
	totalMarks: number;
	rank: number;
};

export type ReportRankingQuery = {
	departmentId?: string;
	page?: number;
	limit?: number;
};

export type ReportRankingData = {
	docs: ReportRankingRow[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
	message: string;
};

export type ReportRankingResponse = ApiSuccessEnvelope<ReportRankingData>;

export type WhatsAppPerformerBucket = "top" | "medium" | "bottom";
export type WhatsAppSendStatus = "pending" | "sent" | "failed" | "skipped";

export type WhatsAppSendRecord = {
	_id: string;
	organizationId: string;
	periodId: string;
	batchId: string;
	employeeId?: string;
	departmentId?: string;
	phoneDigits?: string;
	phoneMasked?: string;
	status: WhatsAppSendStatus;
	performerBucket?: WhatsAppPerformerBucket;
	campaignName?: string;
	templateParams?: unknown;
	dryRun?: boolean;
	providerResponse?: unknown;
	errorMessage?: string;
	triggeredByUserId?: string;
	sentAt?: string;
	createdAt?: string;
	updatedAt?: string;
};

export type WhatsAppSendBody = {
	dryRun?: boolean;
	departmentId?: string;
	delayMs?: number;
	resend?: boolean;
};

/** `BACKGROUND_JOBS_SYNC=true` inline completion. */
export type WhatsAppSendSyncData = {
	mode?: "sync";
	batchId: string;
	summary: {
		sent: number;
		failed: number;
		skipped: number;
		dryRun: boolean;
	};
	departmentNamesSample?: string[];
	message: string;
};

/** Queued batch; poll `GET /api/v1/jobs/:jobId` for `returnvalue`. */
export type WhatsAppSendQueuedData = {
	mode: "queued";
	jobId: string;
	message: string;
};

export type WhatsAppSendSyncResponse = ApiSuccessEnvelope<WhatsAppSendSyncData>;

export type WhatsAppSendQueuedResponse = ApiSuccessEnvelope<WhatsAppSendQueuedData>;

export type ListWhatsAppSendsQuery = {
	page?: number;
	limit?: number;
	status?: WhatsAppSendStatus;
	departmentId?: string;
};

export type ListWhatsAppSendsData = {
	docs: WhatsAppSendRecord[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
	message: string;
};

export type ListWhatsAppSendsResponse =
	ApiSuccessEnvelope<ListWhatsAppSendsData>;

const BASE = "/api/v1/reports";

// ──────────────────────────────────────────────
// Query keys
// ──────────────────────────────────────────────

export const reportKeys = {
	all: ["reports"] as const,
	list: () => [...reportKeys.all, "list"] as const,
	summary: (periodId: string) =>
		[...reportKeys.all, "summary", periodId] as const,
	departmentRoles: (periodId: string, filters?: DepartmentRoleStatsQuery) =>
		[...reportKeys.all, "department-roles", periodId, filters] as const,
	ranking: (
		periodId: string,
		scope: RankingScope,
		params?: ReportRankingQuery,
	) => [...reportKeys.all, "ranking", periodId, scope, params] as const,
	whatsappSends: (periodId: string, params?: ListWhatsAppSendsQuery) =>
		[...reportKeys.all, "whatsapp-sends", periodId, params] as const,
};

// ──────────────────────────────────────────────
// API functions
// ──────────────────────────────────────────────

export async function listReportRuns(): Promise<ListReportRunsResponse> {
	const { data } = await api.get<ListReportRunsResponse>(BASE);
	return data;
}

export async function getReportSummary(
	periodId: string,
): Promise<ReportSummaryResponse> {
	const { data } = await api.get<ReportSummaryResponse>(
		`${BASE}/${periodId}/summary`,
	);
	return data;
}

export async function getDepartmentRoleStats(
	periodId: string,
	params: DepartmentRoleStatsQuery = {},
): Promise<DepartmentRoleStatsResponse> {
	const { data } = await api.get<DepartmentRoleStatsResponse>(
		`${BASE}/${periodId}/department-roles`,
		{ params },
	);
	return data;
}

export async function getReportRanking(
	periodId: string,
	scope: RankingScope,
	params: ReportRankingQuery = {},
): Promise<ReportRankingResponse> {
	const { data } = await api.get<ReportRankingResponse>(
		`${BASE}/${periodId}/ranking/${scope}`,
		{ params },
	);
	return data;
}

export async function downloadDepartmentReportZip(periodId: string): Promise<Blob> {
	const res = await api.get<Blob>(`${BASE}/${periodId}/department-report-zip`, {
		responseType: "blob",
		validateStatus: () => true,
	});

	const contentType = String(res.headers["content-type"] || "");
	if (res.status >= 400 || contentType.includes("application/json")) {
		let message = `Download failed (${res.status})`;
		try {
			const text = await (res.data as Blob).text();
			const parsed = JSON.parse(text) as {
				message?: string;
				title?: string;
				data?: { message?: string; title?: string };
			};
			message =
				parsed?.data?.message ??
				parsed?.data?.title ??
				parsed?.message ??
				parsed?.title ??
				message;
		} catch {
			// keep default message
		}
		throw new Error(message);
	}

	return res.data;
}

export type SendWhatsAppPerformanceResult =
	| { httpStatus: 200; envelope: WhatsAppSendSyncResponse }
	| { httpStatus: 202; envelope: WhatsAppSendQueuedResponse };

/**
 * Returns **200** + summary when `BACKGROUND_JOBS_SYNC=true`, else **202** + `jobId` to poll {@link getJob}.
 */
export async function sendWhatsAppPerformance(
	periodId: string,
	body: WhatsAppSendBody = {},
): Promise<SendWhatsAppPerformanceResult> {
	const res = await api.post<WhatsAppSendSyncResponse | WhatsAppSendQueuedResponse>(
		`${BASE}/${periodId}/whatsapp/send`,
		body,
		{
			validateStatus: (s) => s === 200 || s === 202,
		},
	);
	if (res.status === 202) {
		return { httpStatus: 202, envelope: res.data as WhatsAppSendQueuedResponse };
	}
	return { httpStatus: 200, envelope: res.data as WhatsAppSendSyncResponse };
}

export async function listWhatsAppSends(
	periodId: string,
	params: ListWhatsAppSendsQuery = {},
): Promise<ListWhatsAppSendsResponse> {
	const { data } = await api.get<ListWhatsAppSendsResponse>(
		`${BASE}/${periodId}/whatsapp/sends`,
		{ params },
	);
	return data;
}

// ──────────────────────────────────────────────
// React Query hooks
// ──────────────────────────────────────────────

export function useListReportRuns() {
	return useQuery({
		queryKey: reportKeys.list(),
		queryFn: listReportRuns,
	});
}

export function useReportSummary(periodId: string) {
	return useQuery({
		queryKey: reportKeys.summary(periodId),
		queryFn: () => getReportSummary(periodId),
		enabled: !!periodId,
	});
}

export function useDepartmentRoleStats(
	periodId: string,
	params: DepartmentRoleStatsQuery = {},
) {
	return useQuery({
		queryKey: reportKeys.departmentRoles(periodId, params),
		queryFn: () => getDepartmentRoleStats(periodId, params),
		enabled: !!periodId,
	});
}

export function useReportRanking(
	periodId: string,
	scope: RankingScope,
	params: ReportRankingQuery = {},
) {
	const enabled =
		!!periodId &&
		(scope === "overall" ||
			(scope === "department" && !!params.departmentId));

	return useQuery({
		queryKey: reportKeys.ranking(periodId, scope, params),
		queryFn: () => getReportRanking(periodId, scope, params),
		enabled,
	});
}

export function useDownloadDepartmentReportZip() {
	return useMutation({
		mutationFn: ({ periodId }: { periodId: string }) =>
			downloadDepartmentReportZip(periodId),
	});
}

export function useSendWhatsAppPerformance(periodId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (body: WhatsAppSendBody) => sendWhatsAppPerformance(periodId, body),
		onSuccess: (result) => {
			if (result.httpStatus === 200) {
				queryClient.invalidateQueries({
					queryKey: reportKeys.whatsappSends(periodId),
				});
			}
		},
	});
}

export function useListWhatsAppSends(
	periodId: string,
	params: ListWhatsAppSendsQuery = {},
) {
	return useQuery({
		queryKey: reportKeys.whatsappSends(periodId, params),
		queryFn: () => listWhatsAppSends(periodId, params),
		enabled: !!periodId,
	});
}
