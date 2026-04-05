import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/axios";
import type { ApiSuccessEnvelope } from "@/queries/departments";
import { organizationKeys } from "@/queries/auth";

import { orgInvitationKeys } from "./organization-invitations";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export type OrgInvitationImportTemplateFormat = "csv" | "xlsx";

export type OrgInvitationImportSkipped = {
	email: string;
	reason: string;
};

export type OrgInvitationImportRowError = {
	row?: number;
	email?: string;
	message: string;
};

export type OrgInvitationImportEmailFailure = {
	email: string;
	message: string;
};

export type OrgInvitationImportData = {
	created: number;
	resent: number;
	skipped: OrgInvitationImportSkipped[];
	errors: OrgInvitationImportRowError[];
	emailFailures: OrgInvitationImportEmailFailure[];
	totalProcessed: number;
	message: string;
};

export type OrgInvitationImportResponse =
	ApiSuccessEnvelope<OrgInvitationImportData>;

const BASE = "/api/v1/organization/invitations";

// ──────────────────────────────────────────────
// API
// ──────────────────────────────────────────────

export async function downloadOrganizationInvitationsImportTemplate(
	format: OrgInvitationImportTemplateFormat = "csv",
): Promise<Blob> {
	const { data } = await api.get<Blob>(`${BASE}/import/template`, {
		params: { format },
		responseType: "blob",
	});
	return data;
}

export async function importOrganizationInvitations(
	file: File,
): Promise<OrgInvitationImportResponse> {
	const formData = new FormData();
	formData.append("file", file);
	const { data } = await api.post<OrgInvitationImportResponse>(
		`${BASE}/import`,
		formData,
	);
	return data;
}

// ──────────────────────────────────────────────
// Hooks
// ──────────────────────────────────────────────

export function useDownloadOrganizationInvitationsImportTemplate() {
	return useMutation({
		mutationFn: downloadOrganizationInvitationsImportTemplate,
	});
}

export function useImportOrganizationInvitations() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: importOrganizationInvitations,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: organizationKeys.invitations() });
			queryClient.invalidateQueries({ queryKey: orgInvitationKeys.all });
		},
	});
}
