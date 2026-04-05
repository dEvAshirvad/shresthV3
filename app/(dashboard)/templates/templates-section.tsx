"use client";

import { useAuth } from "@/components/providers/auth-provider";

import { TemplatesDataTable } from "./templates-data-table";

export function TemplatesSection() {
	const { session } = useAuth();
	const orgReady = Boolean(session?.activeOrganizationId);

	if (!orgReady) {
		return (
			<p className="text-muted-foreground text-sm">
				Select an active organization before managing KPI templates.
			</p>
		);
	}

	return <TemplatesDataTable />;
}
