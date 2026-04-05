"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import {
	AuthLoadingScreen,
	useAuth,
} from "@/components/providers/auth-provider";
import { getOrgDashboardAccess } from "@/lib/org-role";
import { useGetActiveOrganizationMember } from "@/queries/auth";

type StaffHomeGateProps = {
	children: React.ReactNode;
};

/**
 * `/staff` is only for org members whose role is not owner/admin/nodal.
 * Others are redirected to the dashboard or nodal entry route.
 */
export function StaffHomeGate({ children }: StaffHomeGateProps) {
	const router = useRouter();
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

	const waitingForMember =
		Boolean(orgId) &&
		memberPending &&
		!session?.activeOrganizationRole &&
		!memberError;

	useEffect(() => {
		if (!orgId) {
			router.replace("/onboarding");
			return;
		}
		if (waitingForMember) return;

		if (access !== "staff") {
			router.replace(access === "nodal" ? "/templates" : "/dashboard");
		}
	}, [orgId, waitingForMember, access, router]);

	if (!orgId) {
		return <AuthLoadingScreen />;
	}

	if (waitingForMember) {
		return <AuthLoadingScreen />;
	}

	if (access !== "staff") {
		return <AuthLoadingScreen />;
	}

	return <>{children}</>;
}
