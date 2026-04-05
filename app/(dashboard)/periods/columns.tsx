"use client";

import { type ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { formatIsoInstantInIst } from "@/lib/business-date";
import type { KpiPeriodDocument, KpiPeriodStatus } from "@/queries/periods";

import { PeriodDataTableRowActions } from "./data-table-row-actions";

type PeriodAdminAction = "periodDates" | "forceLock" | "reports";

export type PeriodColumnsOptions = {
	isOrgAdmin: boolean;
	onPeriodAdmin: (action: PeriodAdminAction, period: KpiPeriodDocument) => void;
};

function statusVariant(status: KpiPeriodStatus) {
	if (status === "active") return "success" as const;
	if (status === "locked") return "secondary" as const;
	return "outline" as const;
}

export function getPeriodColumns(
	opts: PeriodColumnsOptions,
): ColumnDef<KpiPeriodDocument>[] {
	return [
		{
			accessorKey: "name",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Name" />
			),
			cell: ({ row }) => (
				<span className="max-w-[200px] truncate font-medium">
					{row.getValue("name")}
				</span>
			),
			filterFn: "includesString",
		},
		{
			accessorKey: "key",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Key" />
			),
			cell: ({ row }) => (
				<span className="text-muted-foreground font-mono text-xs">
					{row.getValue("key")}
				</span>
			),
			filterFn: "includesString",
		},
		{
			accessorKey: "status",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Status" />
			),
			cell: ({ row }) => {
				const s = row.getValue("status") as KpiPeriodStatus;
				return (
					<Badge variant={statusVariant(s)} className="capitalize">
						{s}
					</Badge>
				);
			},
			filterFn: "includesString",
		},
		{
			accessorKey: "startDate",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Start" />
			),
			cell: ({ row }) => (
				<span className="text-muted-foreground text-sm" title="Asia/Kolkata">
					{formatIsoInstantInIst(row.getValue("startDate") as string)}
				</span>
			),
		},
		{
			accessorKey: "endDate",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="End" />
			),
			cell: ({ row }) => (
				<span className="text-muted-foreground text-sm" title="Asia/Kolkata">
					{formatIsoInstantInIst(row.getValue("endDate") as string)}
				</span>
			),
		},
		{
			accessorKey: "_id",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Period ID" />
			),
			cell: ({ row }) => (
				<span className="text-muted-foreground max-w-[120px] truncate font-mono text-xs">
					{row.getValue("_id")}
				</span>
			),
		},
		{
			id: "actions",
			cell: ({ row }) => (
				<PeriodDataTableRowActions
					row={row}
					isOrgAdmin={opts.isOrgAdmin}
					onPeriodAdmin={opts.onPeriodAdmin}
				/>
			),
		},
	];
}
