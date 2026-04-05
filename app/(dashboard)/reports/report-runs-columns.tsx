"use client";

import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ReportRun } from "@/queries/reports";

export function getReportRunColumns(): ColumnDef<ReportRun>[] {
	return [
		{
			accessorKey: "periodKey",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Period" />
			),
			cell: ({ row }) => (
				<span className="max-w-[140px] truncate font-medium">
					{row.getValue("periodKey")}
				</span>
			),
			filterFn: "includesString",
		},
		{
			accessorKey: "periodId",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Period ID" />
			),
			cell: ({ row }) => (
				<span className="text-muted-foreground max-w-[120px] truncate font-mono text-xs">
					{row.getValue("periodId")}
				</span>
			),
			filterFn: "includesString",
		},
		{
			accessorKey: "generatedAt",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Generated" />
			),
			cell: ({ row }) => (
				<span className="text-muted-foreground text-sm">
					{new Date(row.getValue("generatedAt") as string).toLocaleString()}
				</span>
			),
		},
		{
			accessorKey: "status",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Status" />
			),
			cell: ({ row }) => (
				<Badge variant="secondary" className="capitalize">
					{String(row.getValue("status"))}
				</Badge>
			),
			filterFn: "includesString",
		},
		{
			id: "actions",
			cell: ({ row }) => {
				const r = row.original;
				return (
					<Button type="button" size="sm" variant="outline" asChild>
						<Link href={`/reports/${encodeURIComponent(r.periodId)}`}>View</Link>
					</Button>
				);
			},
		},
	];
}
