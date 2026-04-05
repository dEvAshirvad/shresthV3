"use client";

import { type ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { OrganizationInvitation } from "@/queries/auth";

export type InvitationTableRow = OrganizationInvitation;

function statusBadgeVariant(status: string) {
	const s = status.toLowerCase();
	if (s === "accepted") return "success" as const;
	if (s === "pending" || s === "sent") return "secondary" as const;
	if (
		s === "rejected" ||
		s === "cancelled" ||
		s === "canceled" ||
		s === "expired"
	) {
		return "destructive" as const;
	}
	return "outline" as const;
}

export function getInvitationColumns(): ColumnDef<InvitationTableRow>[] {
	return [
		{
			id: "email",
			accessorKey: "email",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Email" />
			),
			cell: ({ row }) => (
				<span className="max-w-[280px] truncate font-medium">
					{row.getValue("email")}
				</span>
			),
			filterFn: "includesString",
		},
		{
			accessorKey: "role",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Role" />
			),
			cell: ({ row }) => (
				<span className="bg-muted rounded-md px-2 py-0.5 text-xs font-medium capitalize">
					{row.getValue("role") as string}
				</span>
			),
			filterFn: "includesString",
		},
		{
			id: "status",
			accessorKey: "status",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Status" />
			),
			cell: ({ row }) => {
				const status = row.getValue("status") as string;
				return (
					<Badge
						variant={statusBadgeVariant(status)}
						className={cn("normal-case tracking-normal")}>
						{status}
					</Badge>
				);
			},
			filterFn: "includesString",
		},
		{
			accessorKey: "expiresAt",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Expires" />
			),
			cell: ({ row }) => (
				<span className="text-muted-foreground text-sm">
					{new Date(row.getValue("expiresAt") as string).toLocaleString()}
				</span>
			),
		},
		{
			accessorKey: "id",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Invitation ID" />
			),
			cell: ({ row }) => (
				<span className="font-mono text-xs">{row.getValue("id")}</span>
			),
		},
	];
}
