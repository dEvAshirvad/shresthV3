"use client";

import { type ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import type { Employee } from "@/queries/employee";

import { EmployeeDataTableRowActions } from "./data-table-row-actions";

export function departmentLabel(emp: Employee): string {
	const d = emp.department;
	if (!d) return "—";
	if (typeof d === "string") return d;
	return d.name ?? d.slug ?? d._id ?? "—";
}

export type EmployeeColumnActions = {
	onEdit: (row: Employee) => void;
};

export function getEmployeeColumns(
	actions: EmployeeColumnActions,
): ColumnDef<Employee>[] {
	return [
		{
			accessorKey: "name",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Name" />
			),
			cell: ({ row }) => (
				<span className="max-w-[220px] truncate font-medium">
					{row.getValue("name")}
				</span>
			),
			filterFn: "includesString",
		},
		{
			accessorKey: "phone",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Phone" />
			),
			cell: ({ row }) => (
				<span className="text-muted-foreground">{row.getValue("phone")}</span>
			),
			filterFn: "includesString",
		},
		{
			id: "email",
			accessorFn: (row) => row.email ?? "",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Email" />
			),
			cell: ({ row }) => (
				<span className="text-muted-foreground max-w-[200px] truncate">
					{row.original.email ?? "—"}
				</span>
			),
			filterFn: "includesString",
		},
		{
			id: "departmentLabel",
			accessorFn: (row) => departmentLabel(row),
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Department" />
			),
			cell: ({ row }) => (
				<span className="max-w-[200px] truncate">
					{departmentLabel(row.original)}
				</span>
			),
			filterFn: "includesString",
		},
		{
			accessorKey: "departmentRole",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Role" />
			),
			cell: ({ row }) => (
				<span className="text-muted-foreground">
					{row.getValue("departmentRole")}
				</span>
			),
			filterFn: "includesString",
		},
		{
			id: "actions",
			cell: ({ row }) => (
				<EmployeeDataTableRowActions
					row={row}
					onEdit={() => actions.onEdit(row.original)}
				/>
			),
		},
	];
}
