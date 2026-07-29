import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/axios";
import { organizationKeys } from "@/queries/auth";
import type { ApiSuccessEnvelope } from "@/queries/employee";
import { orgInvitationKeys } from "@/queries/organization-invitations";

// ──────────────────────────────────────────────
// Types — see queries/docs/nodal.api.md
// ──────────────────────────────────────────────

const BASE = "/api/v1/nodal";

export type NodalRecord = {
	_id: string;
	name: string;
	phone: string;
	email?: string | null;
	empId?: string | null;
	organizationId?: string;
	userId?: unknown;
	memberId?: unknown;
	invitationId?: unknown;
	metadata?: unknown;
	createdAt?: string;
	updatedAt?: string;
};

export type ListNodalsQuery = {
	page?: number;
	limit?: number;
	search?: string;
};

export type ListNodalsData = {
	docs: NodalRecord[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
	message: string;
};

export type ListNodalsResponse = ApiSuccessEnvelope<ListNodalsData>;

export type NodalCredential = {
	nodalId?: string;
	name: string;
	phone: string;
	email?: string;
	empId: string;
	password: string;
	whatsapp?: {
		ok: boolean;
		skipped?: boolean;
		message?: string;
		destination?: string;
	};
};

export type NodalSingleData = {
	nodal: NodalRecord;
	credentials?: NodalCredential;
	message: string;
};

export type NodalSingleResponse = ApiSuccessEnvelope<NodalSingleData>;

export type NodalCreateBody = {
	name: string;
	phone: string;
	email?: string;
};

export type NodalUpdateBody = {
	name?: string;
	phone?: string;
	email?: string | null;
};

export type NodalImportTemplateFormat = "csv" | "xlsx";

export type NodalImportData = {
	insertedCount: number;
	updatedCount: number;
	skippedProvisioned?: number;
	totalProcessed: number;
	credentials?: NodalCredential[];
	provisionErrors?: Array<{ phone?: string; message: string }>;
	message: string;
};

export type NodalImportResponse = ApiSuccessEnvelope<NodalImportData>;

export type ProvisionNodalCredentialsData = {
	credentials: NodalCredential[];
	errors: Array<{ nodalId: string; phone?: string; message: string }>;
	message: string;
};

export type ProvisionNodalCredentialsResponse =
	ApiSuccessEnvelope<ProvisionNodalCredentialsData>;

export type DownloadAllNodalCredentialsData = {
	credentials: NodalCredential[];
	errors: Array<{ nodalId: string; phone?: string; message: string }>;
	total: number;
	message: string;
};

export type DownloadAllNodalCredentialsResponse =
	ApiSuccessEnvelope<DownloadAllNodalCredentialsData>;

export type ResetNodalPasswordData = {
	credentials: NodalCredential;
	message: string;
};

export type ResetNodalPasswordResponse =
	ApiSuccessEnvelope<ResetNodalPasswordData>;

export type SyncNodalsFromOrgMembersData = {
	linked: number;
	skipped: Array<{ nodalId?: string; email?: string; reason: string }>;
	message: string;
};

export type SyncNodalsFromOrgMembersResponse =
	ApiSuccessEnvelope<SyncNodalsFromOrgMembersData>;

export type SendNodalInvitationsData = {
	nodals: Array<{ id: string; name: string; email: string; phone: string }>;
	errors: Array<{ nodalId: string; email?: string; message: string }>;
	message: string;
};

export type SendNodalInvitationsResponse =
	ApiSuccessEnvelope<SendNodalInvitationsData>;

export type AttachNodalUserMemberBody = {
	userId: string;
	memberId: string;
};

export type NodalAssignmentCheckData = {
	/** Explicit false means user is not mapped/assigned. */
	isAssigned?: boolean;
	message?: string;
	[key: string]: unknown;
};

export type NodalAssignmentCheckResponse =
	ApiSuccessEnvelope<NodalAssignmentCheckData>;

// ──────────────────────────────────────────────
// Query keys
// ──────────────────────────────────────────────

export const nodalKeys = {
	all: ["nodal"] as const,
	list: (params: ListNodalsQuery) => [...nodalKeys.all, "list", params] as const,
	detail: (id: string) => [...nodalKeys.all, "detail", id] as const,
	assignment: () => [...nodalKeys.all, "assignment"] as const,
};

// ──────────────────────────────────────────────
// API
// ──────────────────────────────────────────────

export async function listNodals(
	params: ListNodalsQuery = {},
): Promise<ListNodalsResponse> {
	const { data } = await api.get<ListNodalsResponse>(BASE, { params });
	return data;
}

export async function getNodal(id: string): Promise<NodalSingleResponse> {
	const { data } = await api.get<NodalSingleResponse>(`${BASE}/${id}`);
	return data;
}

export async function createNodal(
	body: NodalCreateBody,
): Promise<NodalSingleResponse> {
	const { data } = await api.post<NodalSingleResponse>(BASE, body);
	return data;
}

export async function updateNodal(
	id: string,
	body: NodalUpdateBody,
): Promise<NodalSingleResponse> {
	const { data } = await api.put<NodalSingleResponse>(`${BASE}/${id}`, body);
	return data;
}

export async function deleteNodal(id: string): Promise<NodalSingleResponse> {
	const { data } = await api.delete<NodalSingleResponse>(`${BASE}/${id}`);
	return data;
}

export async function downloadNodalImportTemplate(
	format: NodalImportTemplateFormat = "csv",
): Promise<Blob> {
	const { data } = await api.get<Blob>(`${BASE}/import/template`, {
		params: { format },
		responseType: "blob",
	});
	return data;
}

export async function importNodals(file: File): Promise<NodalImportResponse> {
	const formData = new FormData();
	formData.append("file", file);
	const { data } = await api.post<NodalImportResponse>(
		`${BASE}/import`,
		formData,
	);
	return data;
}

export async function syncNodalsFromOrgMembers(): Promise<SyncNodalsFromOrgMembersResponse> {
	const { data } = await api.post<SyncNodalsFromOrgMembersResponse>(
		`${BASE}/sync-from-org-members`,
		{},
	);
	return data;
}

export async function sendInvitationToRestNodals(): Promise<SendNodalInvitationsResponse> {
	const { data } = await api.post<SendNodalInvitationsResponse>(
		`${BASE}/send-invitation-to-rest-nodals`,
		{},
	);
	return data;
}

export async function provisionNodalCredentials(): Promise<ProvisionNodalCredentialsResponse> {
	const { data } = await api.post<ProvisionNodalCredentialsResponse>(
		`${BASE}/provision-credentials`,
		{},
	);
	return data;
}

export async function downloadAllNodalCredentials(): Promise<DownloadAllNodalCredentialsResponse> {
	const { data } = await api.post<DownloadAllNodalCredentialsResponse>(
		`${BASE}/download-all-credentials`,
		{},
	);
	return data;
}

export async function resetNodalPassword(
	id: string,
): Promise<ResetNodalPasswordResponse> {
	const { data } = await api.post<ResetNodalPasswordResponse>(
		`${BASE}/${id}/reset-password`,
		{},
	);
	return data;
}

export async function attachNodalUserIdAndMemberId(
	email: string,
	body: AttachNodalUserMemberBody,
): Promise<NodalSingleResponse> {
	const encoded = encodeURIComponent(email);
	const { data } = await api.post<NodalSingleResponse>(
		`${BASE}/${encoded}/attach-user-id-and-member-id`,
		body,
	);
	return data;
}

export async function amINodalAssigned(): Promise<NodalAssignmentCheckResponse> {
	const { data } = await api.get<NodalAssignmentCheckResponse>(
		`${BASE}/am-i-assigned`,
	);
	return data;
}

// ──────────────────────────────────────────────
// Hooks
// ──────────────────────────────────────────────

export function useListNodals(
	params: ListNodalsQuery = {},
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: nodalKeys.list(params),
		queryFn: () => listNodals(params),
		enabled: options?.enabled ?? true,
	});
}

export function useNodalAssignmentCheck(options?: { enabled?: boolean }) {
	return useQuery({
		queryKey: nodalKeys.assignment(),
		queryFn: amINodalAssigned,
		enabled: options?.enabled ?? true,
	});
}

export function useDownloadNodalImportTemplate() {
	return useMutation({ mutationFn: downloadNodalImportTemplate });
}

export function useImportNodals() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: importNodals,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: nodalKeys.all });
		},
	});
}

export function useSyncNodalsFromOrgMembers() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: syncNodalsFromOrgMembers,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: nodalKeys.all });
		},
	});
}

export function useSendInvitationToRestNodals() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: sendInvitationToRestNodals,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: nodalKeys.all });
			queryClient.invalidateQueries({ queryKey: orgInvitationKeys.all });
			queryClient.invalidateQueries({
				queryKey: organizationKeys.invitations(),
			});
		},
	});
}

export function useProvisionNodalCredentials() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: provisionNodalCredentials,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: nodalKeys.all });
		},
	});
}

export function useDownloadAllNodalCredentials() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: () => downloadAllNodalCredentials(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: nodalKeys.all });
		},
	});
}

export function useResetNodalPassword() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: resetNodalPassword,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: nodalKeys.all });
		},
	});
}

export function useCreateNodal() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: createNodal,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: nodalKeys.all });
		},
	});
}

export function useUpdateNodal() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, body }: { id: string; body: NodalUpdateBody }) =>
			updateNodal(id, body),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: nodalKeys.all });
		},
	});
}

export function useDeleteNodal() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: deleteNodal,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: nodalKeys.all });
		},
	});
}
