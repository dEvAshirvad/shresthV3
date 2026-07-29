"use client";

import { useMemo } from "react";
import { X } from "lucide-react";

import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDecimal2 } from "@/lib/number-format";
import { useEntry } from "@/queries/entries";

import { getEntryLineItemColumns } from "./entry-line-items-columns";
import { mapEntryItemsToRows } from "./map-entry-line-items";

type EntryDetailPanelProps = {
	entryId: string;
	employeeLabel: string;
	templateLabel: string;
	periodLabel: string;
	onClear: () => void;
};

function statusVariant(s: string) {
	if (s === "draft") return "secondary" as const;
	if (s === "submitted") return "success" as const;
	return "outline" as const;
}

export function EntryDetailPanel({
	entryId,
	employeeLabel,
	templateLabel,
	periodLabel,
	onClear,
}: EntryDetailPanelProps) {
	const q = useEntry(entryId);
	const entry = q.data?.data?.entry;

	const lineRows = useMemo(() => {
		if (!entry?.items?.length) return [];
		return mapEntryItemsToRows(entry.items);
	}, [entry?.items]);

	const columns = useMemo(() => getEntryLineItemColumns(), []);

	const title = entry
		? `${entry.employee?.name ?? employeeLabel} · ${entry.template?.name ?? templateLabel}`
		: "Entry line items";

	return (
		<div className="space-y-4 pt-6 border-t border-border">
			<div className=" flex flex-wrap items-center justify-between gap-3 bg-card px-6 py-4">
				<div className="min-w-0 space-y-1">
					<h3 className="text-foreground text-sm font-semibold tracking-tight">
						{title}
					</h3>
					{entry && (
						<div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
							<span>{periodLabel}</span>
							<span aria-hidden>·</span>
							<Badge
								variant={statusVariant(entry.status)}
								className="capitalize">
								{entry.status}
							</Badge>
							<span aria-hidden>·</span>
							<span className="tabular-nums">
								{formatDecimal2(entry.obtainedMarks)} /{" "}
								{formatDecimal2(entry.totalMarks)} marks
							</span>
							{entry.roleSnapshot ? (
								<>
									<span aria-hidden>·</span>
									<span className="max-w-[200px] truncate" title={entry.roleSnapshot}>
										Role: {entry.roleSnapshot}
									</span>
								</>
							) : null}
						</div>
					)}
				</div>
				<Button
					type="button"
					size="sm"
					className="shrink-0 gap-1"
					onClick={onClear}>
					<X className="size-4" />
					Close
				</Button>
			</div>

			<div className="">
				{q.isPending && (
					<div className="space-y-3">
						<Skeleton className="h-8 w-full" />
						<Skeleton className="h-48 w-full" />
					</div>
				)}
				{q.isError && (
					<p className="text-destructive text-sm">
						Could not load entry details.
					</p>
				)}
				{q.isSuccess && entry && (
					<DataTable
						columns={columns}
						data={lineRows}
						getRowId={(row) => row.id}
						defaultPageSize={50}
						emptyMessage="No line items on this entry."
						showPagination={false}
					/>
				)}
			</div>
		</div>
	);
}
