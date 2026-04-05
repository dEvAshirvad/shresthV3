"use client";

import { useMemo } from "react";

import { DataTable } from "@/components/data-table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { usePendingInvitationsForRoles } from "@/queries/organization-invitations";

import { getInvitationColumns } from "./invitations-columns";
import { InvitationsToolbar } from "./invitations-toolbar";

type Variant = "admin" | "nodal";

const ROLES_FOR_VARIANT: Record<
	Variant,
	readonly ("admin" | "nodal")[]
> = {
	admin: ["admin"],
	nodal: ["nodal"],
};

export function AdminInvitationsDataTable() {
	return <OrganizationInvitationsDataTableInner variant="admin" />;
}

export function NodalInvitationsDataTable() {
	return <OrganizationInvitationsDataTableInner variant="nodal" />;
}

function OrganizationInvitationsDataTableInner({ variant }: { variant: Variant }) {
	const { data: invitations, isPending, isError, error, refetch } =
		usePendingInvitationsForRoles(ROLES_FOR_VARIANT[variant]);

	const columns = useMemo(() => getInvitationColumns(), []);

	const emptyMessage =
		variant === "admin"
			? "No pending admin invitations."
			: "No pending nodal invitations.";

	if (isPending) {
		return (
			<div className="space-y-3">
				<Skeleton className="h-10 w-full max-w-sm" />
				<Skeleton className="h-10 w-full max-w-sm" />
				<Skeleton className="h-48 w-full rounded-md" />
			</div>
		);
	}

	if (isError) {
		return (
			<Alert variant="destructive">
				<AlertTitle>Could not load invitations</AlertTitle>
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
			data={invitations}
			getRowId={(row) => row.id}
			defaultPageSize={10}
			emptyMessage={emptyMessage}
			renderToolbar={(table) => (
				<InvitationsToolbar table={table} total={invitations.length} />
			)}
		/>
	);
}
