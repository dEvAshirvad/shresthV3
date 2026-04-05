"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import {
	AuthLoadingScreen,
	useAuth,
} from "@/components/providers/auth-provider";
import {
	getOrgDashboardAccess,
	isPathAllowedForDashboardAccess,
} from "@/lib/org-role";
import { useGetActiveOrganizationMember } from "@/queries/auth";
import { useNodalAssignmentCheck } from "@/queries/nodal";

type DashboardRoleGateProps = {
	children: React.ReactNode;
};

/**
 * Restricts `(dashboard)` routes: staff → `/staff`, nodal → templates/employee/entries only.
 * Uses `GET /api/auth/organization/get-active-member` when an active org is set, with session role as fallback.
 */
export function DashboardRoleGate({ children }: DashboardRoleGateProps) {
	const router = useRouter();
	const pathname = usePathname();
	const { session } = useAuth();
	const orgId = session?.activeOrganizationId;

	const {
		data: activeMember,
		isPending: memberPending,
		isError: memberError,
	} = useGetActiveOrganizationMember({
		enabled: Boolean(orgId),
	});

	const role =
		(!memberError ? activeMember?.role : null) ??
		session?.activeOrganizationRole ??
		null;
	const access = getOrgDashboardAccess(role);
	const isNodal = access === "nodal";

	const sessionRoleKnown = Boolean(session?.activeOrganizationRole);
	const waitingForMember =
		Boolean(orgId) &&
		memberPending &&
		!sessionRoleKnown &&
		!memberError;

	const nodalAssignment = useNodalAssignmentCheck({
		enabled: Boolean(orgId) && isNodal && !waitingForMember,
	});
	const nodalNotAssigned =
		isNodal && nodalAssignment.data?.data?.isAssigned === false;
	const waitingForAssignment = isNodal && nodalAssignment.isPending;

	useEffect(() => {
		if (!orgId) {
			router.replace("/onboarding");
			return;
		}
		if (waitingForMember) return;

		if (access === "staff") {
			router.replace("/staff");
			return;
		}

		if (nodalNotAssigned) {
			router.replace("/not-assigned");
			return;
		}

		if (!isPathAllowedForDashboardAccess(access, pathname)) {
			router.replace("/templates");
		}
	}, [orgId, waitingForMember, access, pathname, router, nodalNotAssigned]);

	if (!orgId) {
		return <AuthLoadingScreen />;
	}

	if (waitingForMember) {
		return <AuthLoadingScreen />;
	}

	if (waitingForAssignment) {
		return <AuthLoadingScreen />;
	}

	if (access === "staff") {
		return <AuthLoadingScreen />;
	}

	if (nodalNotAssigned) {
		return <AuthLoadingScreen />;
	}

	if (!isPathAllowedForDashboardAccess(access, pathname)) {
		return <AuthLoadingScreen />;
	}

	return <>{children}</>;
}
