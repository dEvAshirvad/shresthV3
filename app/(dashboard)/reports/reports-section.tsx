"use client";

import { useAuth } from "@/components/providers/auth-provider";

import { ReportsWorkspace } from "./reports-workspace";

export function ReportsSection() {
	const { session } = useAuth();
	const orgReady = Boolean(session?.activeOrganizationId);

	if (!orgReady) {
		return (
			<p className="text-muted-foreground text-sm">
				Select an active organization before viewing KPI reports.
			</p>
		);
	}

	return <ReportsWorkspace />;
}
