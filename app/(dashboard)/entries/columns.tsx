"use client";

import { type ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDecimal2 } from "@/lib/number-format";
import type { KpiEntryStatus } from "@/queries/entries";

import type { EntryTableRow } from "./map-entry-row";
import { EntryDataTableRowActions } from "./data-table-row-actions";

function statusVariant(s: KpiEntryStatus) {
	if (s === "draft") return "secondary" as const;
	if (s === "submitted") return "success" as const;
	return "outline" as const;
}

export type EntryColumnActions = {
	onView: (row: EntryTableRow) => void;
	onSubmit: (row: EntryTableRow) => void;
	onDelete: (row: EntryTableRow) => void;
	submitPending: boolean;
	deletePending: boolean;
};

export function getEntryColumns(
	actions: EntryColumnActions,
): ColumnDef<EntryTableRow>[] {
	return [
		{
			id: "select",
			enableSorting: false,
			enableHiding: false,
			header: ({ table }) => {
				const draftRows = table
					.getRowModel()
					.rows.filter((r) => r.original.status === "draft");
				const allSelected =
					draftRows.length > 0 && draftRows.every((r) => r.getIsSelected());
				const someSelected = draftRows.some((r) => r.getIsSelected());
				return (
					<Checkbox
						aria-label="Select all drafts on this page"
						checked={
							allSelected
								? true
								: someSelected
									? "indeterminate"
									: false
						}
						onCheckedChange={(value) => {
							const on = value === true;
							draftRows.forEach((r) => r.toggleSelected(on));
						}}
					/>
				);
			},
			cell: ({ row }) => {
				const draft = row.original.status === "draft";
				if (!draft) {
					return (
						<span className="text-muted-foreground inline-flex w-8 justify-center text-xs">
							—
						</span>
					);
				}
				return (
					<Checkbox
						aria-label={`Select ${row.original.employeeLabel}`}
						checked={row.getIsSelected()}
						onCheckedChange={(value) => row.toggleSelected(!!value)}
					/>
				);
			},
		},
		{
			accessorKey: "status",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Status" />
			),
			cell: ({ row }) => {
				const s = row.getValue("status") as KpiEntryStatus;
				return (
					<Badge variant={statusVariant(s)} className="capitalize">
						{s}
					</Badge>
				);
			},
			filterFn: "includesString",
		},
		{
			accessorKey: "employeeLabel",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Employee" />
			),
			cell: ({ row }) => (
				<div className="max-w-[200px]">
					<div className="truncate font-medium">
						{row.original.employeeLabel}
					</div>
					<div className="text-muted-foreground truncate font-mono text-xs">
						{row.original.employeeId}
					</div>
				</div>
			),
			filterFn: "includesString",
		},
		{
			accessorKey: "templateLabel",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Template" />
			),
			cell: ({ row }) => (
				<div className="max-w-[200px]">
					<div className="truncate">{row.original.templateLabel}</div>
					<div className="text-muted-foreground truncate font-mono text-xs">
						{row.original.templateId}
					</div>
				</div>
			),
			filterFn: "includesString",
		},
		{
			accessorKey: "periodLabel",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Period" />
			),
			cell: ({ row }) => (
				<div className="max-w-[180px]">
					<div className="truncate text-sm">{row.original.periodLabel}</div>
					<div className="text-muted-foreground truncate font-mono text-xs">
						{row.original.periodId}
					</div>
				</div>
			),
			filterFn: "includesString",
		},
		{
			id: "marks",
			accessorFn: (row) => row.obtainedMarks ?? Number.NEGATIVE_INFINITY,
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Marks" />
			),
			cell: ({ row }) => {
				const o = row.original.obtainedMarks;
				const t = row.original.totalMarks;
				return (
					<span className="text-muted-foreground tabular-nums text-sm">
						{formatDecimal2(o)} / {formatDecimal2(t)}
					</span>
				);
			},
		},
		{
			id: "actions",
			cell: ({ row }) => (
				<EntryDataTableRowActions
					row={row}
					onView={() => actions.onView(row.original)}
					onSubmit={() => actions.onSubmit(row.original)}
					onDelete={() => actions.onDelete(row.original)}
					submitPending={actions.submitPending}
					deletePending={actions.deletePending}
				/>
			),
		},
	];
}
