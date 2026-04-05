"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { getOrgDashboardAccess } from "@/lib/org-role";
import {
	type OrganizationMember,
	useGetActiveOrganizationMember,
} from "@/queries/auth";
import {
	type ListDepartmentsQuery,
	useListDepartments,
} from "@/queries/departments";

/**
 * Lists departments for the active org. For **nodal** users, passes `assignedNodal` = active member id
 * so search/list only returns departments assigned to them.
 */
export function useOrgDepartments(
	params: ListDepartmentsQuery = {},
	options?: { enabled?: boolean },
) {
	const { session } = useAuth();
	const orgId = session?.activeOrganizationId;

	const { data: memberData, isPending: memberPending, isError: memberError } =
		useGetActiveOrganizationMember({
			enabled: Boolean(orgId),
		});
	const activeMember = memberData as OrganizationMember | undefined;

	const role =
		(!memberError ? activeMember?.role : null) ??
		session?.activeOrganizationRole ??
		null;
	const access = getOrgDashboardAccess(role);
	const needsNodalFilter = access === "nodal";
	const nodalId = needsNodalFilter ? activeMember?.id : undefined;

	const merged: ListDepartmentsQuery = {
		...params,
		...(nodalId ? { assignedNodal: nodalId } : {}),
	};

	const waitForNodalMember =
		Boolean(orgId) &&
		needsNodalFilter &&
		memberPending &&
		!activeMember?.id &&
		!memberError;

	const enabled =
		(options?.enabled ?? true) &&
		Boolean(orgId) &&
		(!needsNodalFilter || Boolean(activeMember?.id)) &&
		!(needsNodalFilter && memberError) &&
		!waitForNodalMember;

	return useListDepartments(merged, { enabled });
}
