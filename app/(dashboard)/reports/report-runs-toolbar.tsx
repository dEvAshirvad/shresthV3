"use client";

import { type Table } from "@tanstack/react-table";
import { X } from "lucide-react";

import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ReportRun } from "@/queries/reports";

type ReportRunsToolbarProps = {
	table: Table<ReportRun>;
};

export function ReportRunsToolbar({ table }: ReportRunsToolbarProps) {
	const isFiltered = table.getState().columnFilters.length > 0;

	return (
		<div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
			<div className="flex flex-1 flex-wrap items-center gap-2">
				<div className="grid min-w-0 flex-1 gap-2 sm:max-w-xs">
					<Label htmlFor="rep-filter-key" className="sr-only">
						Filter by period key
					</Label>
					<Input
						id="rep-filter-key"
						placeholder="Filter by period key…"
						value={(table.getColumn("periodKey")?.getFilterValue() as string) ?? ""}
						onChange={(event) =>
							table.getColumn("periodKey")?.setFilterValue(event.target.value)
						}
						className="w-full min-w-32"
					/>
				</div>
				{isFiltered && (
					<Button
						variant="ghost"
						size="sm"
						className="h-8 px-2 lg:px-3"
						onClick={() => table.resetColumnFilters()}>
						Reset
						<X className="size-4" />
					</Button>
				)}
			</div>
			<DataTableViewOptions table={table} />
		</div>
	);
}
