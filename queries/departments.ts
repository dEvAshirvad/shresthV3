import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";

// ──────────────────────────────────────────────
// Shared envelope & entities
// ──────────────────────────────────────────────

export type ApiSuccessEnvelope<T> = {
	success: boolean;
	status: number;
	timestamp: string;
	cache?: unknown;
	data: T;
	requestId?: string;
};

/** Department document; populated fields depend on endpoint. */
export type Department = {
	_id: string;
	name: string;
	slug: string;
	logo?: string | null;
	metadata?: string | null;
	organizationId?: string | { _id: string } | null;
	assignedNodal?: string | { _id: string; userId?: unknown } | null;
	createdAt?: string;
	updatedAt?: string;
};

export type ListDepartmentsQuery = {
	page?: number;
	limit?: number;
	search?: string;
	/** When set, restrict list to departments assigned to this org member (nodal). */
	assignedNodal?: string;
};

export type ListDepartmentsData = {
	docs: Department[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
	message: string;
};

export type ListDepartmentsResponse = ApiSuccessEnvelope<ListDepartmentsData>;

export type ImportTemplateFormat = "csv" | "xlsx";

export type DepartmentNodalImportError = {
	slug: string;
	email: string;
	reason: string;
};

export type DepartmentImportData = {
	insertedCount: number;
	updatedCount: number;
	totalProcessed: number;
	/** Rows where `nodal_email` was set but no org member matched. */
	nodalAssignmentErrors?: DepartmentNodalImportError[];
	message: string;
};

export type DepartmentImportResponse = ApiSuccessEnvelope<DepartmentImportData>;

export type DepartmentStatisticsData = {
	stats: Array<{ _id: unknown; count: number }>;
	message: string;
};

export type DepartmentStatisticsResponse =
	ApiSuccessEnvelope<DepartmentStatisticsData>;

export type DepartmentSingleData = {
	department: Department;
	message: string;
};

export type DepartmentSingleResponse = ApiSuccessEnvelope<DepartmentSingleData>;

export type DepartmentCreateBody = {
	name: string;
	slug: string;
	logo?: string | null;
	metadata?: string | null;
};

export type DepartmentUpdateBody = {
	name?: string;
	slug?: string;
	logo?: string | null;
	metadata?: string | null;
};

export type DepartmentAssignNodalBody = {
	assignedNodal: string;
};

const BASE = "/api/v1/departments";

// ──────────────────────────────────────────────
// Query keys
// ──────────────────────────────────────────────

export const departmentKeys = {
	all: ["departments"] as const,
	list: (params: ListDepartmentsQuery) =>
		[...departmentKeys.all, "list", params] as const,
	detail: (id: string) => [...departmentKeys.all, "detail", id] as const,
	statistics: () => [...departmentKeys.all, "organization-statistics"] as const,
};

// ──────────────────────────────────────────────
// API functions
// ──────────────────────────────────────────────

export async function listDepartments(
	params: ListDepartmentsQuery = {},
): Promise<ListDepartmentsResponse> {
	const { data } = await api.get<ListDepartmentsResponse>(BASE, { params });
	return data;
}

/**
 * Downloads the import template file. Caller should save the blob (e.g. anchor download) or read as text for CSV.
 */
export async function downloadImportTemplate(
	format: ImportTemplateFormat = "csv",
): Promise<Blob> {
	const { data } = await api.get<Blob>(`${BASE}/import/template`, {
		params: { format },
		responseType: "blob",
	});
	return data;
}

export async function importDepartments(
	file: File,
): Promise<DepartmentImportResponse> {
	const formData = new FormData();
	formData.append("file", file);
	const { data } = await api.post<DepartmentImportResponse>(
		`${BASE}/import`,
		formData,
	);
	return data;
}

export async function getDepartmentStatistics(): Promise<DepartmentStatisticsResponse> {
	const { data } = await api.get<DepartmentStatisticsResponse>(
		`${BASE}/organization/statistics`,
	);
	return data;
}

export async function getDepartment(
	id: string,
): Promise<DepartmentSingleResponse> {
	const { data } = await api.get<DepartmentSingleResponse>(`${BASE}/${id}`);
	return data;
}

export async function createDepartment(
	body: DepartmentCreateBody,
): Promise<DepartmentSingleResponse> {
	const { data } = await api.post<DepartmentSingleResponse>(BASE, body);
	return data;
}

export async function updateDepartment(
	id: string,
	body: DepartmentUpdateBody,
): Promise<DepartmentSingleResponse> {
	const { data } = await api.put<DepartmentSingleResponse>(
		`${BASE}/${id}`,
		body,
	);
	return data;
}

export async function assignDepartmentNodal(
	id: string,
	body: DepartmentAssignNodalBody,
): Promise<DepartmentSingleResponse> {
	const { data } = await api.patch<DepartmentSingleResponse>(
		`${BASE}/${id}`,
		body,
	);
	return data;
}

export async function deleteDepartment(
	id: string,
): Promise<DepartmentSingleResponse> {
	const { data } = await api.delete<DepartmentSingleResponse>(`${BASE}/${id}`);
	return data;
}

// ──────────────────────────────────────────────
// React Query hooks
// ──────────────────────────────────────────────

export function useListDepartments(
	params: ListDepartmentsQuery = {},
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: departmentKeys.list(params),
		queryFn: () => listDepartments(params),
		enabled: options?.enabled ?? true,
	});
}

export function useDepartmentStatistics() {
	return useQuery({
		queryKey: departmentKeys.statistics(),
		queryFn: getDepartmentStatistics,
	});
}

export function useDepartment(id: string) {
	return useQuery({
		queryKey: departmentKeys.detail(id),
		queryFn: () => getDepartment(id),
		enabled: !!id,
	});
}

export function useDownloadDepartmentImportTemplate() {
	return useMutation({
		mutationFn: downloadImportTemplate,
	});
}

export function useImportDepartments() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: importDepartments,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: departmentKeys.all });
		},
	});
}

export function useCreateDepartment() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: createDepartment,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: departmentKeys.all });
		},
	});
}

export function useUpdateDepartment() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, body }: { id: string; body: DepartmentUpdateBody }) =>
			updateDepartment(id, body),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: departmentKeys.all });
			queryClient.invalidateQueries({
				queryKey: departmentKeys.detail(variables.id),
			});
		},
	});
}

export function useAssignDepartmentNodal() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			id,
			body,
		}: {
			id: string;
			body: DepartmentAssignNodalBody;
		}) => assignDepartmentNodal(id, body),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: departmentKeys.all });
			queryClient.invalidateQueries({
				queryKey: departmentKeys.detail(variables.id),
			});
		},
	});
}

export function useDeleteDepartment() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: deleteDepartment,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: departmentKeys.all });
		},
	});
}
