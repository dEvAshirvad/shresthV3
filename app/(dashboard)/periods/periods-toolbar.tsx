"use client";

import { type Table } from "@tanstack/react-table";
import { X } from "lucide-react";

import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { KpiPeriodDocument } from "@/queries/periods";

const STATUS_OPTIONS: { value: string; label: string }[] = [
	{ value: "all", label: "All statuses" },
	{ value: "active", label: "Active" },
	{ value: "locked", label: "Locked" },
	{ value: "closed", label: "Closed" },
];

type PeriodsToolbarProps = {
	table: Table<KpiPeriodDocument>;
	statusFilter: string;
	onStatusFilterChange: (value: string) => void;
};

export function PeriodsToolbar({
	table,
	statusFilter,
	onStatusFilterChange,
}: PeriodsToolbarProps) {
	const isFiltered =
		table.getState().columnFilters.length > 0 || statusFilter !== "all";

	return (
		<div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
			<div className="flex flex-1 flex-wrap items-center gap-2">
				<Input
					placeholder="Filter by name..."
					value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
					onChange={(event) =>
						table.getColumn("name")?.setFilterValue(event.target.value)
					}
					className="w-full min-w-32 sm:max-w-xs"
				/>
				<div className="flex items-center gap-2">
					<Label htmlFor="period-status-filter" className="sr-only">
						Status
					</Label>
					<Select
						value={statusFilter}
						onValueChange={onStatusFilterChange}>
						<SelectTrigger
							id="period-status-filter"
							className="border-border bg-input w-[180px] min-h-10">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{STATUS_OPTIONS.map((o) => (
								<SelectItem key={o.value} value={o.value}>
									{o.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				{isFiltered && (
					<Button
						variant="ghost"
						size="sm"
						onClick={() => {
							table.resetColumnFilters();
							onStatusFilterChange("all");
						}}
						className="h-8 px-2 lg:px-3">
						Reset
						<X className="size-4" />
					</Button>
				)}
			</div>
			<DataTableViewOptions table={table} />
		</div>
	);
}
