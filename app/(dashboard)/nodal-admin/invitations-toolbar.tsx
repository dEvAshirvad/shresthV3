"use client";

import { type Table } from "@tanstack/react-table";
import { X } from "lucide-react";

import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { InvitationTableRow } from "./invitations-columns";

type InvitationsToolbarProps = {
	table: Table<InvitationTableRow>;
	total: number;
};

export function InvitationsToolbar({ table, total }: InvitationsToolbarProps) {
	const isFiltered = table.getState().columnFilters.length > 0;

	return (
		<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<div className="flex flex-1 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
				<Input
					placeholder="Filter by email..."
					value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
					onChange={(event) =>
						table.getColumn("email")?.setFilterValue(event.target.value)
					}
					className="w-full min-w-32 sm:max-w-xs"
				/>
				{isFiltered && (
					<Button
						variant="ghost"
						size="sm"
						onClick={() => table.resetColumnFilters()}
						className="h-8 px-2 lg:px-3">
						Reset
						<X className="size-4" />
					</Button>
				)}
			</div>
			<div className="flex flex-wrap items-center gap-2 sm:justify-end">
				<p className="text-muted-foreground hidden text-sm md:block">
					{total} invitation{total === 1 ? "" : "s"}
				</p>
				<DataTableViewOptions table={table} />
			</div>
		</div>
	);
}
