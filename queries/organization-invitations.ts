import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/axios";
import { useAuth } from "@/components/providers/auth-provider";
import type { ApiSuccessEnvelope } from "@/queries/departments";
import {
	listOrganizationInvitations,
	organizationKeys,
	useGetActiveOrganizationMember,
	type OrganizationInvitation,
} from "@/queries/auth";

// ──────────────────────────────────────────────
// GET /api/v1/organization/invitations (see queries/docs/invitations.api.md)
// ──────────────────────────────────────────────

const BASE = "/api/v1/organization/invitations";

export type ListOrgInvitationsV1Query = {
	limit?: number;
	offset?: number;
	sortBy?: string;
	sortDirection?: "asc" | "desc";
	filterField?: string;
	filterOperator?: string;
	/** For `in` / `not_in`, JSON array string (e.g. `["admin","nodal"]`). */
	filterValue?: string;
};

export type ListOrgInvitationsV1Data = {
	invitations: unknown[];
	total: number;
	limit: number;
	offset: number;
	message: string;
};

export type ListOrgInvitationsV1Response =
	ApiSuccessEnvelope<ListOrgInvitationsV1Data>;

export async function listOrgInvitationsV1(
	params: ListOrgInvitationsV1Query = {},
): Promise<ListOrgInvitationsV1Response> {
	const { data } = await api.get<ListOrgInvitationsV1Response>(BASE, {
		params: {
			limit: params.limit ?? 100,
			offset: params.offset ?? 0,
			sortBy: params.sortBy ?? "createdAt",
			sortDirection: params.sortDirection ?? "desc",
			...(params.filterField
				? {
						filterField: params.filterField,
						filterOperator: params.filterOperator ?? "eq",
						filterValue: params.filterValue,
					}
				: {}),
		},
	});
	return data;
}

/** Map Mongo / API document to the shape used by invitation tables. */
export function normalizeV1InvitationDoc(raw: unknown): OrganizationInvitation {
	const r = raw as Record<string, unknown>;
	const idRaw = r._id ?? r.id;
	let id = "";
	if (typeof idRaw === "string") id = idRaw;
	else if (idRaw && typeof idRaw === "object" && "$oid" in idRaw) {
		id = String((idRaw as { $oid: string }).$oid);
	} else if (idRaw && typeof idRaw === "object" && "toString" in idRaw) {
		id = String(idRaw);
	}
	const orgId = r.organizationId;
	let organizationId = "";
	if (typeof orgId === "string") organizationId = orgId;
	else if (orgId && typeof orgId === "object" && "_id" in (orgId as object)) {
		organizationId = String((orgId as { _id?: string })._id ?? "");
	}
	let expiresAt = "";
	const ex = r.expiresAt;
	if (typeof ex === "string") expiresAt = ex;
	else if (ex instanceof Date) expiresAt = ex.toISOString();
	else if (typeof ex === "number") expiresAt = new Date(ex).toISOString();

	return {
		id,
		organizationId,
		email: String(r.email ?? ""),
		role: String(r.role ?? ""),
		status: String(r.status ?? ""),
		expiresAt,
	};
}

export const orgInvitationKeys = {
	all: ["org-invitations-v1"] as const,
	filteredList: (params: ListOrgInvitationsV1Query) =>
		[...orgInvitationKeys.all, "list", params] as const,
};

export function isInviteRoleIn(
	role: string | undefined,
	allowed: ReadonlySet<string>,
): boolean {
	return allowed.has((role ?? "").toLowerCase().trim());
}

const ROLES_ADMIN = ["admin"] as const;
const ROLES_NODAL = ["nodal"] as const;
const ROLES_ADMIN_AND_NODAL = ["admin", "nodal"] as const;

/** Non-terminal invitation rows we treat as “pending” for these tables. */
export function isPendingInvitationStatus(status: string | undefined): boolean {
	const s = (status ?? "").toLowerCase();
	return (
		s === "pending" ||
		s === "sent" ||
		s === "open" ||
		s === "pending_acceptance"
	);
}

function filterPendingForRoles(
	rows: OrganizationInvitation[],
	roles: readonly ("admin" | "nodal")[],
): OrganizationInvitation[] {
	const allowed = new Set(roles.map((r) => r.toLowerCase()));
	return rows.filter(
		(inv) =>
			isInviteRoleIn(inv.role, allowed) &&
			isPendingInvitationStatus(inv.status),
	);
}

/**
 * Pending invitations filtered by org role(s). Uses `GET /api/v1/organization/invitations`
 * with `role in …` when caller is **owner** or **admin**; **nodal** uses Better Auth list
 * + client filter (v1 returns 403 for nodal).
 */
export function usePendingInvitationsForRoles(
	roles: readonly ("admin" | "nodal")[],
) {
	const { session } = useAuth();
	const orgId = session?.activeOrganizationId;
	const { data: activeMember } = useGetActiveOrganizationMember({
		enabled: Boolean(orgId),
	});
	const role = (
		activeMember?.role ??
		session?.activeOrganizationRole ??
		""
	).toLowerCase();
	const preferV1 = role === "owner" || role === "admin";

	const roleKey = [...roles].sort().join(",");
	const v1Params: ListOrgInvitationsV1Query = useMemo(
		() => ({
			limit: 100,
			offset: 0,
			filterField: "role",
			filterOperator: "in",
			filterValue: JSON.stringify([...roles]),
		}),
		[roleKey],
	);

	const v1Query = useQuery({
		queryKey: orgInvitationKeys.filteredList(v1Params),
		queryFn: () => listOrgInvitationsV1(v1Params),
		enabled: Boolean(orgId) && preferV1,
	});

	const legacyQuery = useQuery({
		queryKey: organizationKeys.invitations(),
		queryFn: listOrganizationInvitations,
		enabled: Boolean(orgId) && !preferV1,
	});

	const invitations = useMemo(() => {
		if (preferV1) {
			const raw = v1Query.data?.data?.invitations ?? [];
			const mapped = raw.map(normalizeV1InvitationDoc);
			return filterPendingForRoles(mapped, roles);
		}
		const raw = legacyQuery.data ?? [];
		return filterPendingForRoles(raw, roles);
	}, [preferV1, v1Query.data, legacyQuery.data, roles]);

	const isPending = preferV1 ? v1Query.isPending : legacyQuery.isPending;
	const isError = preferV1 ? v1Query.isError : legacyQuery.isError;
	const error = preferV1 ? v1Query.error : legacyQuery.error;

	const refetch = () =>
		preferV1 ? v1Query.refetch() : legacyQuery.refetch();

	return {
		data: invitations,
		isPending,
		isError,
		error,
		refetch,
	};
}

/** Admin page — pending **admin** org invitations only (`invitations.api.md`). */
export function usePendingAdminInvitations() {
	return usePendingInvitationsForRoles(ROLES_ADMIN);
}

/** Nodal page — pending **nodal** org invitations (from nodal send flow, etc.). */
export function usePendingNodalInvitations() {
	return usePendingInvitationsForRoles(ROLES_NODAL);
}

/** @deprecated Prefer `usePendingAdminInvitations` + `usePendingNodalInvitations` on split pages. */
export function usePendingAdminNodalInvitations() {
	return usePendingInvitationsForRoles(ROLES_ADMIN_AND_NODAL);
}

