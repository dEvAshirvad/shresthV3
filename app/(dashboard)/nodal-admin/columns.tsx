"use client";

import { type ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import type { OrganizationMemberListItem } from "@/queries/auth";

export type MemberTableRow = OrganizationMemberListItem;

export function getMemberColumns(): ColumnDef<MemberTableRow>[] {
	return [
		{
			id: "name",
			accessorFn: (row) => row.user?.name ?? "",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Name" />
			),
			cell: ({ row }) => (
				<span className="max-w-[240px] truncate font-medium">
					{row.original.user?.name ?? "—"}
				</span>
			),
			filterFn: "includesString",
		},
		{
			id: "email",
			accessorFn: (row) => row.user?.email ?? "",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Email" />
			),
			cell: ({ row }) => (
				<span className="text-muted-foreground max-w-[280px] truncate">
					{row.original.user?.email ?? "—"}
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
			accessorKey: "id",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Member ID" />
			),
			cell: ({ row }) => (
				<span className="font-mono text-xs">{row.getValue("id")}</span>
			),
		},
		{
			accessorKey: "createdAt",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Joined" />
			),
			cell: ({ row }) => (
				<span className="text-muted-foreground text-sm">
					{new Date(row.getValue("createdAt") as string).toLocaleDateString()}
				</span>
			),
		},
	];
}
