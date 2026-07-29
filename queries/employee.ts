import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export type ApiSuccessEnvelope<T> = {
	success: boolean;
	status: number;
	timestamp: string;
	cache?: unknown;
	data: T;
	requestId?: string;
};

export type Employee = {
	_id: string;
	name: string;
	phone: string;
	email?: string | null;
	empId?: string | null;
	department: string | { _id: string; name?: string; slug?: string } | null;
	departmentRole: string;
	userId?: string | unknown | null;
	memberId?: string | unknown | null;
	invitationId?: string | unknown | null;
	createdAt?: string;
	updatedAt?: string;
};

export type EmployeeCredential = {
	employeeId?: string;
	name: string;
	phone: string;
	email?: string;
	empId: string;
	password: string;
};

export type ListEmployeesQuery = {
	page?: number;
	limit?: number;
	search?: string;
};

export type ListEmployeesData = {
	docs: Employee[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
	message: string;
};

export type ListEmployeesResponse = ApiSuccessEnvelope<ListEmployeesData>;

export type ImportTemplateFormat = "csv" | "xlsx";

export type EmployeeImportData = {
	insertedCount: number;
	updatedCount: number;
	skippedProvisioned?: number;
	totalProcessed: number;
	credentials?: EmployeeCredential[];
	provisionErrors?: Array<{ phone?: string; message: string }>;
	message: string;
};

export type EmployeeImportResponse = ApiSuccessEnvelope<EmployeeImportData>;

export type EmployeeSingleData = {
	employee: Employee;
	credentials?: EmployeeCredential;
	message: string;
};

export type EmployeeSingleResponse = ApiSuccessEnvelope<EmployeeSingleData>;

export type ProvisionEmployeeCredentialsData = {
	credentials: EmployeeCredential[];
	errors: Array<{ employeeId: string; phone?: string; message: string }>;
	message: string;
};

export type ProvisionEmployeeCredentialsResponse =
	ApiSuccessEnvelope<ProvisionEmployeeCredentialsData>;

export type DownloadAllEmployeeCredentialsData = {
	credentials: EmployeeCredential[];
	errors: Array<{ employeeId: string; phone?: string; message: string }>;
	total: number;
	message: string;
};

export type DownloadAllEmployeeCredentialsResponse =
	ApiSuccessEnvelope<DownloadAllEmployeeCredentialsData>;

export type ResetEmployeePasswordData = {
	credentials: EmployeeCredential;
	message: string;
};

export type ResetEmployeePasswordResponse =
	ApiSuccessEnvelope<ResetEmployeePasswordData>;

export type EmployeeCreateBody = {
	name: string;
	phone: string;
	email?: string;
	department: string;
	departmentRole: string;
};

export type EmployeeUpdateBody = {
	name?: string;
	phone?: string;
	email?: string | null;
	department?: string;
	departmentRole?: string;
};

export type AttachInvitationBody = {
	invitationId: string;
	userId?: string;
	memberId?: string;
};

export type AttachUserIdAndMemberIdBody = {
	userId: string;
	memberId: string;
};

export type SyncEmployeesFromOrgMembersBody = {
	departmentId: string;
};

export type SyncEmployeesFromOrgMembersData = {
	linked: number;
	skipped: Array<{ employeeId: string; email?: string; reason: string }>;
	message: string;
};

export type SyncEmployeesFromOrgMembersResponse =
	ApiSuccessEnvelope<SyncEmployeesFromOrgMembersData>;

export type SendInvitationToRestEmployeesBody = {
	departmentId: string;
};

export type SendInvitationError = {
	employeeId: string;
	email: string;
	message: string;
};

export type SendInvitationToRestEmployeesData = {
	employees: unknown[];
	errors: SendInvitationError[];
	message: string;
};

export type SendInvitationToRestEmployeesResponse =
	ApiSuccessEnvelope<SendInvitationToRestEmployeesData>;

const BASE = "/api/v1/employee";

// ──────────────────────────────────────────────
// Query keys
// ──────────────────────────────────────────────

export const employeeKeys = {
	all: ["employee"] as const,
	list: (params: ListEmployeesQuery) =>
		[...employeeKeys.all, "list", params] as const,
	detail: (id: string) => [...employeeKeys.all, "detail", id] as const,
};

// ──────────────────────────────────────────────
// API functions
// ──────────────────────────────────────────────

export async function listEmployees(
	params: ListEmployeesQuery = {},
): Promise<ListEmployeesResponse> {
	const { data } = await api.get<ListEmployeesResponse>(BASE, { params });
	return data;
}

/**
 * Fetches all employee pages for the active org by walking paginated results.
 * Uses a sane per-page size and stops when `hasNextPage` is false.
 */
export async function listAllEmployees(
	params: Omit<ListEmployeesQuery, "page" | "limit"> = {},
): Promise<Employee[]> {
	const limit = 200;
	let page = 1;
	const all: Employee[] = [];

	while (true) {
		const res = await listEmployees({ ...params, page, limit });
		all.push(...(res.data?.docs ?? []));
		if (!res.data?.hasNextPage) break;
		page += 1;
	}

	return all;
}

export async function downloadEmployeeImportTemplate(
	format: ImportTemplateFormat = "csv",
): Promise<Blob> {
	const { data } = await api.get<Blob>(`${BASE}/import/template`, {
		params: { format },
		responseType: "blob",
	});
	return data;
}

/**
 * Multipart: `file` + `departmentId` (string field). Backend validates `departmentId`.
 */
export async function importEmployees(
	file: File,
	departmentId: string,
): Promise<EmployeeImportResponse> {
	const formData = new FormData();
	formData.append("file", file);
	formData.append("departmentId", departmentId);
	const { data } = await api.post<EmployeeImportResponse>(
		`${BASE}/import`,
		formData,
	);
	return data;
}

export async function getEmployee(id: string): Promise<EmployeeSingleResponse> {
	const { data } = await api.get<EmployeeSingleResponse>(`${BASE}/${id}`);
	return data;
}

export async function createEmployee(
	body: EmployeeCreateBody,
): Promise<EmployeeSingleResponse> {
	const { data } = await api.post<EmployeeSingleResponse>(BASE, body);
	return data;
}

export async function updateEmployee(
	id: string,
	body: EmployeeUpdateBody,
): Promise<EmployeeSingleResponse> {
	const { data } = await api.put<EmployeeSingleResponse>(
		`${BASE}/${id}`,
		body,
	);
	return data;
}

export async function deleteEmployee(
	id: string,
): Promise<EmployeeSingleResponse> {
	const { data } = await api.delete<EmployeeSingleResponse>(`${BASE}/${id}`);
	return data;
}

export async function attachInvitationToEmployee(
	id: string,
	body: AttachInvitationBody,
): Promise<EmployeeSingleResponse> {
	const { data } = await api.post<EmployeeSingleResponse>(
		`${BASE}/${id}/attach-invitation`,
		body,
	);
	return data;
}

/**
 * Docs route: `POST /api/v1/employee/:email/attach-user-id-and-member-id`.
 */
export async function attachUserIdAndMemberIdByEmail(
	email: string,
	body: AttachUserIdAndMemberIdBody,
): Promise<EmployeeSingleResponse> {
	const encodedEmail = encodeURIComponent(email);
	const { data } = await api.post<EmployeeSingleResponse>(
		`${BASE}/${encodedEmail}/attach-user-id-and-member-id`,
		body,
	);
	return data;
}

/**
 * Path `id` is the **invitationId** lookup key (not employee Mongo id).
 */
export async function attachUserIdAndMemberIdByInvitation(
	invitationId: string,
	body: AttachUserIdAndMemberIdBody,
): Promise<EmployeeSingleResponse> {
	const { data } = await api.post<EmployeeSingleResponse>(
		`${BASE}/${invitationId}/attach-user-id-and-member-id`,
		body,
	);
	return data;
}

export async function syncEmployeesFromOrgMembers(
	body: SyncEmployeesFromOrgMembersBody,
): Promise<SyncEmployeesFromOrgMembersResponse> {
	const { data } = await api.post<SyncEmployeesFromOrgMembersResponse>(
		`${BASE}/sync-from-org-members`,
		body,
	);
	return data;
}

export async function sendInvitationToRestEmployees(
	body: SendInvitationToRestEmployeesBody,
): Promise<SendInvitationToRestEmployeesResponse> {
	const { data } = await api.post<SendInvitationToRestEmployeesResponse>(
		`${BASE}/send-invitation-to-rest-employees`,
		body,
	);
	return data;
}

export async function provisionEmployeeCredentials(body?: {
	departmentId?: string;
}): Promise<ProvisionEmployeeCredentialsResponse> {
	const { data } = await api.post<ProvisionEmployeeCredentialsResponse>(
		`${BASE}/provision-credentials`,
		body ?? {},
	);
	return data;
}

export async function downloadAllEmployeeCredentials(params?: {
	departmentId?: string;
}): Promise<DownloadAllEmployeeCredentialsResponse> {
	const { data } = await api.post<DownloadAllEmployeeCredentialsResponse>(
		`${BASE}/download-all-credentials`,
		{},
		{ params: params?.departmentId ? { departmentId: params.departmentId } : {} },
	);
	return data;
}

export async function resetEmployeePassword(
	id: string,
): Promise<ResetEmployeePasswordResponse> {
	const { data } = await api.post<ResetEmployeePasswordResponse>(
		`${BASE}/${id}/reset-password`,
		{},
	);
	return data;
}

// ──────────────────────────────────────────────
// React Query hooks
// ──────────────────────────────────────────────

export function useListEmployees(params: ListEmployeesQuery = {}) {
	return useQuery({
		queryKey: employeeKeys.list(params),
		queryFn: () => listEmployees(params),
	});
}

export function useListAllEmployees(
	params: Omit<ListEmployeesQuery, "page" | "limit"> = {},
) {
	return useQuery({
		queryKey: [...employeeKeys.all, "list-all", params] as const,
		queryFn: () => listAllEmployees(params),
	});
}

export function useEmployee(id: string) {
	return useQuery({
		queryKey: employeeKeys.detail(id),
		queryFn: () => getEmployee(id),
		enabled: !!id,
	});
}

export function useDownloadEmployeeImportTemplate() {
	return useMutation({
		mutationFn: downloadEmployeeImportTemplate,
	});
}

export function useImportEmployees() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			file,
			departmentId,
		}: {
			file: File;
			departmentId: string;
		}) => importEmployees(file, departmentId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: employeeKeys.all });
		},
	});
}

export function useCreateEmployee() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: createEmployee,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: employeeKeys.all });
		},
	});
}

export function useUpdateEmployee() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, body }: { id: string; body: EmployeeUpdateBody }) =>
			updateEmployee(id, body),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: employeeKeys.all });
			queryClient.invalidateQueries({
				queryKey: employeeKeys.detail(variables.id),
			});
		},
	});
}

export function useDeleteEmployee() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: deleteEmployee,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: employeeKeys.all });
		},
	});
}

export function useAttachInvitationToEmployee() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			id,
			body,
		}: {
			id: string;
			body: AttachInvitationBody;
		}) => attachInvitationToEmployee(id, body),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: employeeKeys.all });
			queryClient.invalidateQueries({
				queryKey: employeeKeys.detail(variables.id),
			});
		},
	});
}

export function useAttachUserIdAndMemberIdByEmail() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			email,
			body,
		}: {
			email: string;
			body: AttachUserIdAndMemberIdBody;
		}) => attachUserIdAndMemberIdByEmail(email, body),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: employeeKeys.all });
		},
	});
}

export function useAttachUserIdAndMemberIdByInvitation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			invitationId,
			body,
		}: {
			invitationId: string;
			body: AttachUserIdAndMemberIdBody;
		}) => attachUserIdAndMemberIdByInvitation(invitationId, body),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: employeeKeys.all });
		},
	});
}

export function useSyncEmployeesFromOrgMembers() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: syncEmployeesFromOrgMembers,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: employeeKeys.all });
		},
	});
}

export function useSendInvitationToRestEmployees() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: sendInvitationToRestEmployees,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: employeeKeys.all });
		},
	});
}

export function useProvisionEmployeeCredentials() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (body?: { departmentId?: string }) =>
			provisionEmployeeCredentials(body),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: employeeKeys.all });
		},
	});
}

export function useDownloadAllEmployeeCredentials() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (params?: { departmentId?: string }) =>
			downloadAllEmployeeCredentials(params),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: employeeKeys.all });
		},
	});
}

export function useResetEmployeePassword() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: resetEmployeePassword,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: employeeKeys.all });
		},
	});
}
