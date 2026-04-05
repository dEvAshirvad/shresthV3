"use client";

import { useMemo, useState } from "react";

import { DataTable } from "@/components/data-table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useListOrganizationMembers } from "@/queries/auth";

import { getMemberColumns } from "./columns";
import {
	membersQueryForFilter,
	type RoleFilterValue,
} from "./data/role-filter";
import { NodalAdminToolbar } from "./nodal-admin-toolbar";

export function OrganizationMembersDataTable() {
	const [roleFilter, setRoleFilter] = useState<RoleFilterValue>("all");

	const query = useMemo(() => membersQueryForFilter(roleFilter), [roleFilter]);

	const { data, isPending, isError, error, refetch } =
		useListOrganizationMembers(query);
	const members = data?.members ?? [];
	const total = data?.total ?? 0;

	const columns = useMemo(() => getMemberColumns(), []);

	if (isPending) {
		return (
			<div className="space-y-3">
				<Skeleton className="h-10 w-full max-w-sm" />
				<Skeleton className="h-10 w-full max-w-sm" />
				<Skeleton className="h-64 w-full rounded-md" />
			</div>
		);
	}

	if (isError) {
		return (
			<Alert variant="destructive">
				<AlertTitle>Could not load members</AlertTitle>
				<AlertDescription className="flex flex-col gap-2">
					<span>{error instanceof Error ? error.message : "Request failed"}</span>
					<button
						type="button"
						className="text-sm underline"
						onClick={() => void refetch()}>
						Retry
					</button>
				</AlertDescription>
			</Alert>
		);
	}

	return (
		<DataTable
			columns={columns}
			data={members}
			getRowId={(row) => row.id}
			defaultPageSize={10}
			emptyMessage="No members match this filter."
			renderToolbar={(table) => (
				<NodalAdminToolbar
					table={table}
					roleFilter={roleFilter}
					onRoleFilterChange={setRoleFilter}
					total={total}
				/>
			)}
		/>
	);
}
