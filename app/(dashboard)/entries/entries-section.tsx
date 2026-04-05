"use client";

import { useAuth } from "@/components/providers/auth-provider";

import { EntriesDataTable } from "./entries-data-table";

export function EntriesSection() {
	const { session } = useAuth();
	const orgReady = Boolean(session?.activeOrganizationId);

	if (!orgReady) {
		return (
			<p className="text-muted-foreground text-sm">
				Select an active organization before viewing KPI entries.
			</p>
		);
	}

	return <EntriesDataTable />;
}
