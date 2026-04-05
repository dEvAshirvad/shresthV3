import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { ApiSuccessEnvelope } from "@/queries/departments";
import type { KpiItemJudgement, KpiTemplate } from "@/queries/templates";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export type KpiEntryStatus = "draft" | "submitted" | "locked";

/** Populated employee on GET-enriched entry responses. */
export type KpiEntryEmployee = {
	_id: string;
	name: string;
	email?: string;
	phone?: string;
	department?: string;
	departmentRole?: string;
	[key: string]: unknown;
};

/**
 * One merged line: template definition (e.g. judgement) plus saved scores.
 * GET list/detail return this shape; writes may omit judgement/template-only fields.
 */
export type KpiEntryItem = {
	templateItemId: string;
	title?: string;
	inputType?: string;
	maxMarks?: number;
	judgement?: KpiItemJudgement;
	isActive?: boolean;
	description?: string | null;
	awardedMarks?: number;
	inputValueNumber?: number;
	inputValueBoolean?: boolean;
	remarks?: string;
	[key: string]: unknown;
};

export type KpiEntry = {
	_id: string;
	employeeId: string;
	/** Present on GET-enriched responses. */
	employee?: KpiEntryEmployee;
	templateId: string;
	/** Present on GET-enriched responses (includes template items / judgement defs). */
	template?: KpiTemplate;
	periodId: string;
	organizationId?: string;
	departmentId?: string;
	roleSnapshot?: string;
	items: KpiEntryItem[];
	awardedMarks?: number;
	totalMarks?: number;
	obtainedMarks?: number;
	status: KpiEntryStatus;
	createdAt?: string;
	updatedAt?: string;
};

/** Mongo / populated `{ _id, name?, ... }` or `{ $oid }` → id string. */
export function normalizeRefId(raw: unknown): string {
	if (raw == null) return "";
	if (typeof raw === "string") return raw.trim();
	if (typeof raw === "object" && raw !== null) {
		if ("$oid" in raw && typeof (raw as { $oid?: unknown }).$oid === "string") {
			return (raw as { $oid: string }).$oid.trim();
		}
		if ("_id" in raw) {
			const id = (raw as { _id?: unknown })._id;
			if (typeof id === "string") return id.trim();
			if (id && typeof id === "object" && id !== null && "$oid" in id) {
				return String((id as { $oid: string }).$oid).trim();
			}
		}
	}
	return "";
}

function normalizeKpiEntryItem(raw: unknown): KpiEntryItem {
	const row = raw as Record<string, unknown>;
	return {
		...(row as KpiEntryItem),
		templateItemId: normalizeRefId(row.templateItemId),
	};
}

/**
 * Normalizes ids to strings, preserves GET-enriched `employee` / `template` and merged
 * `items`. Hoists legacy populated `employeeId` / `templateId` objects into optional
 * `employee` / `template` when the split fields are absent.
 */
export function normalizeKpiEntry(
	raw: KpiEntry | Record<string, unknown>,
): KpiEntry {
	const e = raw as Record<string, unknown>;

	let employeeId = normalizeRefId(e.employeeId);
	let templateId = normalizeRefId(e.templateId);

	let employee =
		e.employee != null ? (e.employee as KpiEntryEmployee) : undefined;
	if (
		!employee &&
		typeof e.employeeId === "object" &&
		e.employeeId !== null &&
		"_id" in (e.employeeId as object)
	) {
		employee = e.employeeId as KpiEntryEmployee;
		if (!employeeId) employeeId = normalizeRefId(e.employeeId);
	}

	let template =
		e.template != null ? (e.template as KpiTemplate) : undefined;
	if (
		!template &&
		typeof e.templateId === "object" &&
		e.templateId !== null &&
		"_id" in (e.templateId as object)
	) {
		template = e.templateId as KpiTemplate;
		if (!templateId) templateId = normalizeRefId(e.templateId);
	}

	const baseItems = Array.isArray(e.items) ? e.items : [];
	const items = baseItems.map((row) => normalizeKpiEntryItem(row));

	const out: KpiEntry = {
		...(raw as KpiEntry),
		employeeId,
		templateId,
		periodId: normalizeRefId(e.periodId),
		items,
	};
	if (employee !== undefined) out.employee = employee;
	if (template !== undefined) out.template = template;
	if (e.departmentId !== undefined) {
		out.departmentId = normalizeRefId(e.departmentId);
	}
	if (e.organizationId !== undefined) {
		out.organizationId = normalizeRefId(e.organizationId);
	}
	return out;
}

function normalizeEntryEnvelope(
	data: EntrySingleResponse,
): EntrySingleResponse {
	if (!data.data?.entry) return data;
	return {
		...data,
		data: {
			...data.data,
			entry: normalizeKpiEntry(data.data.entry),
		},
	};
}

function normalizeListEntriesEnvelope(
	data: ListEntriesResponse,
): ListEntriesResponse {
	if (!data.data?.docs?.length) return data;
	return {
		...data,
		data: {
			...data.data,
			docs: data.data.docs.map((doc) => normalizeKpiEntry(doc)),
		},
	};
}

function normalizeBulkSubmitEnvelope(
	data: BulkSubmitEntriesResponse,
): BulkSubmitEntriesResponse {
	if (!data.data?.submitted?.length) return data;
	return {
		...data,
		data: {
			...data.data,
			submitted: data.data.submitted.map((doc) => normalizeKpiEntry(doc)),
		},
	};
}

export type KpiEntryUpsertItemInput = {
	templateItemId: string;
	inputValueNumber?: number;
	inputValueBoolean?: boolean;
	remarks?: string;
};

export type KpiEntryUpsertBody = {
	employeeId: string;
	templateId: string;
	periodId?: string;
	items: KpiEntryUpsertItemInput[];
};

export type ListEntriesQuery = {
	page?: number;
	limit?: number;
	employeeId?: string;
	periodId?: string;
	templateId?: string;
};

export type ListEntriesData = {
	docs: KpiEntry[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
	message: string;
};

export type ListEntriesResponse = ApiSuccessEnvelope<ListEntriesData>;

export type EntrySingleData = {
	entry: KpiEntry;
	message: string;
};

export type EntrySingleResponse = ApiSuccessEnvelope<EntrySingleData>;

export type ImportTemplateFormat = "csv" | "xlsx";

export type EntriesImportTemplateQuery = {
	templateId: string;
	departmentId: string;
	format?: ImportTemplateFormat;
};

/** Filled export — same layout as template, cells from saved entries. */
export type EntriesExportEntriesQuery = {
	templateId: string;
	departmentId: string;
	periodId?: string;
	format?: ImportTemplateFormat;
};

export type EntriesImportQuery = {
	templateId: string;
	departmentId: string;
	periodId?: string;
};

export type EntriesImportRowError = {
	row: number;
	employeeId: string;
	message: string;
};

/** Import success payload (may be wrapped in `ApiSuccessEnvelope` by the server). */
export type EntriesImportData = {
	processed: number;
	upserted: number;
	errors: EntriesImportRowError[];
	periodId: string;
	message: string;
};

export type EntriesImportResponse = ApiSuccessEnvelope<EntriesImportData>;

export type BulkSubmitEntryError = {
	entryId: string;
	message: string;
};

export type BulkSubmitEntriesData = {
	submitted: KpiEntry[];
	errors: BulkSubmitEntryError[];
	submittedCount: number;
	errorCount: number;
	message: string;
};

export type BulkSubmitEntriesResponse =
	ApiSuccessEnvelope<BulkSubmitEntriesData>;

export type BulkSubmitEntriesBody = {
	entryIds: string[];
};

const BASE = "/api/v1/entries";

// ──────────────────────────────────────────────
// Query keys
// ──────────────────────────────────────────────

export const entryKeys = {
	all: ["entries"] as const,
	list: (params: ListEntriesQuery) =>
		[...entryKeys.all, "list", params] as const,
	detail: (id: string) => [...entryKeys.all, "detail", id] as const,
};

// ──────────────────────────────────────────────
// API functions
// ──────────────────────────────────────────────

export async function downloadEntriesImportTemplate(
	params: EntriesImportTemplateQuery,
): Promise<Blob> {
	const { data } = await api.get<Blob>(`${BASE}/import/template`, {
		params: {
			templateId: params.templateId,
			departmentId: params.departmentId,
			format: params.format ?? "csv",
		},
		responseType: "blob",
	});
	return data;
}

export async function downloadEntriesExport(
	params: EntriesExportEntriesQuery,
): Promise<Blob> {
	const { data } = await api.get<Blob>(`${BASE}/import/entries`, {
		params: {
			templateId: params.templateId,
			departmentId: params.departmentId,
			format: params.format ?? "csv",
			...(params.periodId ? { periodId: params.periodId } : {}),
		},
		responseType: "blob",
	});
	return data;
}

export async function importEntries(
	file: File,
	query: EntriesImportQuery,
): Promise<EntriesImportResponse> {
	const formData = new FormData();
	formData.append("file", file);
	const { data } = await api.post<EntriesImportResponse>(
		`${BASE}/import`,
		formData,
		{
			params: {
				templateId: query.templateId,
				departmentId: query.departmentId,
				...(query.periodId ? { periodId: query.periodId } : {}),
			},
		},
	);
	return data;
}

export async function listEntries(
	params: ListEntriesQuery = {},
): Promise<ListEntriesResponse> {
	const { data } = await api.get<ListEntriesResponse>(BASE, { params });
	return normalizeListEntriesEnvelope(data);
}

export async function getEntry(id: string): Promise<EntrySingleResponse> {
	const { data } = await api.get<EntrySingleResponse>(`${BASE}/${id}`);
	return normalizeEntryEnvelope(data);
}

export async function upsertKpiEntryDraft(
	body: KpiEntryUpsertBody,
): Promise<EntrySingleResponse> {
	const { data } = await api.post<EntrySingleResponse>(BASE, body);
	return normalizeEntryEnvelope(data);
}

export async function submitKpiEntry(id: string): Promise<EntrySingleResponse> {
	const { data } = await api.post<EntrySingleResponse>(
		`${BASE}/${id}/submit`,
		{},
	);
	return normalizeEntryEnvelope(data);
}

export async function bulkSubmitKpiEntries(
	body: BulkSubmitEntriesBody,
): Promise<BulkSubmitEntriesResponse> {
	const { data } = await api.post<BulkSubmitEntriesResponse>(
		`${BASE}/bulk-submit`,
		body,
	);
	return normalizeBulkSubmitEnvelope(data);
}

export async function deleteDraftEntry(
	id: string,
): Promise<EntrySingleResponse> {
	const { data } = await api.delete<EntrySingleResponse>(`${BASE}/${id}`);
	return normalizeEntryEnvelope(data);
}

// ──────────────────────────────────────────────
// React Query hooks
// ──────────────────────────────────────────────

export function useListEntries(params: ListEntriesQuery = {}) {
	return useQuery({
		queryKey: entryKeys.list(params),
		queryFn: () => listEntries(params),
	});
}

export function useEntry(id: string, options?: { enabled?: boolean }) {
	return useQuery({
		queryKey: entryKeys.detail(id),
		queryFn: () => getEntry(id),
		enabled: (options?.enabled ?? true) && !!id,
	});
}

export function useDownloadEntriesImportTemplate() {
	return useMutation({
		mutationFn: downloadEntriesImportTemplate,
	});
}

export function useDownloadEntriesExport() {
	return useMutation({
		mutationFn: downloadEntriesExport,
	});
}

export function useImportEntries() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ file, query }: { file: File; query: EntriesImportQuery }) =>
			importEntries(file, query),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: entryKeys.all });
		},
	});
}

export function useUpsertKpiEntryDraft() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: upsertKpiEntryDraft,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: entryKeys.all });
		},
	});
}

export function useSubmitKpiEntry() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: submitKpiEntry,
		onSuccess: (_data, id) => {
			queryClient.invalidateQueries({ queryKey: entryKeys.all });
			queryClient.invalidateQueries({ queryKey: entryKeys.detail(id) });
		},
	});
}

export function useBulkSubmitKpiEntries() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: bulkSubmitKpiEntries,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: entryKeys.all });
		},
	});
}

export function useDeleteDraftEntry() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: deleteDraftEntry,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: entryKeys.all });
		},
	});
}
