"use client";

import { type ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";

export type EntryLineItemRow = {
	id: string;
	title: string;
	inputType: string;
	judgementType: string;
	maxMarks: number;
	valueLabel: string;
	awardedMarks: number;
	remarks: string;
};

export function getEntryLineItemColumns(): ColumnDef<EntryLineItemRow>[] {
	return [
		{
			accessorKey: "title",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Line item" />
			),
			cell: ({ row }) => (
				<span className="max-w-[220px] font-medium">{row.original.title}</span>
			),
		},
		{
			accessorKey: "judgementType",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Judgement" />
			),
			cell: ({ row }) => (
				<span className="text-muted-foreground text-sm capitalize">
					{row.original.judgementType || "—"}
				</span>
			),
		},
		{
			accessorKey: "maxMarks",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Max" />
			),
			cell: ({ row }) => (
				<span className="tabular-nums">{row.original.maxMarks}</span>
			),
		},
		{
			accessorKey: "valueLabel",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Value" />
			),
			cell: ({ row }) => (
				<span className="tabular-nums">{row.original.valueLabel}</span>
			),
		},
		{
			accessorKey: "awardedMarks",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Awarded" />
			),
			cell: ({ row }) => (
				<span className="font-medium tabular-nums text-emerald-700 dark:text-emerald-400">
					{row.original.awardedMarks}
				</span>
			),
		},
		{
			accessorKey: "remarks",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Remarks" />
			),
			cell: ({ row }) => (
				<span className="text-muted-foreground max-w-[200px] truncate text-sm">
					{row.original.remarks || "—"}
				</span>
			),
		},
	];
}
