"use client";

import { type ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";

import { DataTableRowActions } from "./data-table-row-actions";

/** Fields for the department list — maps from API `Department` */
export type DepartmentTableRow = {
	id: string;
	name: string;
	slug: string;
	assignedNodal: string | null;
	updatedAt: string;
};

export type DepartmentColumnActions = {
	onEdit: (row: DepartmentTableRow) => void;
	onAssignNodal: (row: DepartmentTableRow) => void;
};

export function getDepartmentColumns(
	actions: DepartmentColumnActions,
): ColumnDef<DepartmentTableRow>[] {
	return [
		{
			accessorKey: "name",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Department" />
			),
			cell: ({ row }) => (
				<span className="max-w-[320px] truncate font-medium">
					{row.getValue("name")}
				</span>
			),
			filterFn: "includesString",
		},
		{
			accessorKey: "slug",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Slug" />
			),
			cell: ({ row }) => (
				<span className="text-muted-foreground">{row.getValue("slug")}</span>
			),
			filterFn: "includesString",
		},
		{
			accessorKey: "assignedNodal",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Assigned nodal" />
			),
			cell: ({ row }) => {
				const v = row.getValue("assignedNodal") as string | null;
				return v ? (
					<span>{v}</span>
				) : (
					<span className="text-muted-foreground">Unassigned</span>
				);
			},
			filterFn: "includesString",
		},
		{
			accessorKey: "updatedAt",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Last updated" />
			),
			cell: ({ row }) => (
				<span className="text-muted-foreground">{row.getValue("updatedAt")}</span>
			),
		},
		{
			id: "nodalStatus",
			accessorFn: (row) => (row.assignedNodal ? "assigned" : "unassigned"),
			header: () => null,
			cell: () => null,
			enableHiding: false,
			enableSorting: false,
			filterFn: (row, _id, value: string[]) => {
				if (!value?.length) return true;
				const status = row.original.assignedNodal ? "assigned" : "unassigned";
				return value.includes(status);
			},
		},
		{
			id: "actions",
			cell: ({ row }) => (
				<DataTableRowActions
					row={row}
					onEdit={() => actions.onEdit(row.original)}
					onAssignNodal={() => actions.onAssignNodal(row.original)}
				/>
			),
		},
	];
}
