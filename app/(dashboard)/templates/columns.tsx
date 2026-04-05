"use client";

import { type ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";

import { TemplateDataTableRowActions } from "./data-table-row-actions";
import type { TemplateTableRow } from "./map-template-row";

export function getTemplateColumns(): ColumnDef<TemplateTableRow>[] {
	return [
		{
			accessorKey: "name",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Name" />
			),
			cell: ({ row }) => (
				<span className="max-w-[260px] truncate font-medium">
					{row.getValue("name")}
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
				<span className="text-muted-foreground">{row.getValue("role")}</span>
			),
			filterFn: "includesString",
		},
		{
			id: "departmentLabel",
			accessorKey: "departmentLabel",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Department" />
			),
			cell: ({ row }) => (
				<span className="max-w-[200px] truncate">{row.original.departmentLabel}</span>
			),
			filterFn: "includesString",
		},
		{
			id: "itemsCount",
			accessorFn: (row) => row.items?.length ?? 0,
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Items" />
			),
			cell: ({ row }) => (
				<span className="text-muted-foreground tabular-nums">
					{row.original.items?.length ?? 0}
				</span>
			),
		},
		{
			accessorKey: "updatedAt",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Updated" />
			),
			cell: ({ row }) => {
				const v = row.getValue("updatedAt") as string | undefined;
				return (
					<span className="text-muted-foreground text-sm">
						{v ? new Date(v).toLocaleDateString() : "—"}
					</span>
				);
			},
		},
		{
			id: "actions",
			cell: ({ row }) => <TemplateDataTableRowActions row={row} />,
		},
	];
}
