"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Download, Eye, Medal } from "lucide-react";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDecimal2, formatPercent2 } from "@/lib/number-format";

import type { ReportRankingTableRow } from "./map-report-ranking-row";

function RankMedal({ rank }: { rank: number }) {
	if (rank === 1) {
		return (
			<span className="inline-flex items-center justify-center" title="1st place">
				<Medal className="size-5 text-amber-500" aria-hidden />
			</span>
		);
	}
	if (rank === 2) {
		return (
			<span className="inline-flex items-center justify-center" title="2nd place">
				<Medal className="size-5 text-slate-400" aria-hidden />
			</span>
		);
	}
	if (rank === 3) {
		return (
			<span className="inline-flex items-center justify-center" title="3rd place">
				<Medal className="size-5 text-amber-700/80" aria-hidden />
			</span>
		);
	}
	return <span className="text-muted-foreground tabular-nums">{rank}</span>;
}

type ColumnOptions = {
	runStatus: string;
};

export function getReportRankingColumns(
	opts: ColumnOptions,
): ColumnDef<ReportRankingTableRow>[] {
	const { runStatus } = opts;

	return [
		{
			id: "rank",
			accessorKey: "rank",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Ranking" />
			),
			cell: ({ row }) => (
				<div className="flex w-12 items-center justify-center">
					<RankMedal rank={row.original.rank} />
				</div>
			),
		},
		{
			id: "member",
			accessorKey: "employeeName",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Member details" />
			),
			cell: ({ row }) => {
				const name = row.original.employeeName?.trim() || "—";
				return (
					<div className="flex min-w-0 max-w-[240px] flex-col gap-0.5">
						<span className="truncate font-medium text-foreground">{name}</span>
						<span className="text-muted-foreground truncate text-xs font-mono">
							{row.original.employeeId}
						</span>
					</div>
				);
			},
		},
		{
			id: "departmentLabel",
			accessorKey: "departmentLabel",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Department" />
			),
			cell: ({ row }) => (
				<span className="max-w-[180px] truncate text-sm">
					{row.original.departmentLabel}
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
				<span className="text-muted-foreground max-w-[120px] truncate">
					{row.original.role ?? "—"}
				</span>
			),
		},
		{
			id: "score",
			accessorKey: "scorePercent",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Score" />
			),
			cell: ({ row }) => {
				const { obtainedMarks, totalMarks, scorePercent } = row.original;
				return (
					<div className="flex flex-col gap-0.5 tabular-nums">
						<span className="font-semibold text-emerald-600 dark:text-emerald-400">
							{formatPercent2(scorePercent)}
						</span>
						<span className="text-muted-foreground text-xs">
							{formatDecimal2(obtainedMarks)} / {formatDecimal2(totalMarks)}
						</span>
					</div>
				);
			},
		},
		{
			id: "status",
			accessorFn: () => runStatus,
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Status" />
			),
			cell: () => (
				<Badge
					variant="secondary"
					className="rounded-full bg-slate-100 font-normal capitalize text-slate-700 dark:bg-slate-800 dark:text-slate-200">
					{runStatus || "—"}
				</Badge>
			),
			enableSorting: false,
			enableColumnFilter: false,
		},
		{
			id: "actions",
			header: () => <span className="sr-only">Actions</span>,
			cell: () => (
				<div className="flex items-center justify-end gap-1">
					<Button
						type="button"
						variant="ghost"
						size="icon"
						className="size-8"
						title="View">
						<Eye className="size-4" />
						<span className="sr-only">View</span>
					</Button>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						className="size-8"
						title="Download"
						disabled>
						<Download className="size-4 opacity-50" />
						<span className="sr-only">Download</span>
					</Button>
				</div>
			),
			enableSorting: false,
			enableHiding: false,
		},
	];
}
