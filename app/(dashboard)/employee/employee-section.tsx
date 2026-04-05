"use client";

import { useAuth } from "@/components/providers/auth-provider";

import { EmployeeDataTable } from "./employee-data-table";

export function EmployeeSection() {
	const { session } = useAuth();
	const orgReady = Boolean(session?.activeOrganizationId);

	if (!orgReady) {
		return (
			<p className="text-muted-foreground text-sm">
				Select an active organization in session before managing employees.
			</p>
		);
	}

	return <EmployeeDataTable />;
}
