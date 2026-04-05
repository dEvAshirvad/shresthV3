"use client";

import { type Table } from "@tanstack/react-table";
import { Link2, Mail, Upload, X } from "lucide-react";

import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Employee } from "@/queries/employee";

type EmployeeToolbarProps = {
	table: Table<Employee>;
	onAdd: () => void;
	onOpenBulkImport: () => void;
	onOpenSendInvitations: () => void;
	onOpenSyncMembers: () => void;
};

export function EmployeeToolbar({
	table,
	onAdd,
	onOpenBulkImport,
	onOpenSendInvitations,
	onOpenSyncMembers,
}: EmployeeToolbarProps) {
	const isFiltered = table.getState().columnFilters.length > 0;

	return (
		<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<div className="flex flex-1 flex-wrap items-center gap-2">
				<Input
					placeholder="Filter by name..."
					value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
					onChange={(event) =>
						table.getColumn("name")?.setFilterValue(event.target.value)
					}
					className="w-full min-w-32 sm:max-w-sm"
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
			<div className="flex flex-wrap items-center gap-2">
				<DataTableViewOptions table={table} />
				<Button type="button" variant="outline" onClick={onOpenBulkImport}>
					<Upload className="size-4" aria-hidden />
					Bulk import
				</Button>
				<Button type="button" variant="outline" onClick={onOpenSendInvitations}>
					<Mail className="size-4" aria-hidden />
					Send invitations
				</Button>
				<Button type="button" variant="outline" onClick={onOpenSyncMembers}>
					<Link2 className="size-4" aria-hidden />
					Sync members
				</Button>
				<Button type="button" onClick={onAdd}>
					Add employee
				</Button>
			</div>
		</div>
	);
}
