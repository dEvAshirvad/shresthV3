"use client";

import { type Table } from "@tanstack/react-table";
import { X } from "lucide-react";

import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { MemberTableRow } from "./columns";
import { ROLE_FILTER_OPTIONS, type RoleFilterValue } from "./data/role-filter";

type NodalAdminToolbarProps = {
	table: Table<MemberTableRow>;
	roleFilter: RoleFilterValue;
	onRoleFilterChange: (value: RoleFilterValue) => void;
	total: number;
};

export function NodalAdminToolbar({
	table,
	roleFilter,
	onRoleFilterChange,
}: NodalAdminToolbarProps) {
	const isFiltered = table.getState().columnFilters.length > 0;

	return (
		<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<div className="flex flex-1 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
				<Input
					placeholder="Filter by name..."
					value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
					onChange={(event) =>
						table.getColumn("name")?.setFilterValue(event.target.value)
					}
					className="w-full min-w-32 sm:max-w-xs"
				/>
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
				<div className="flex items-center gap-2">
					<Label htmlFor="role-filter" className="sr-only">
						Filter by role
					</Label>
					<Select
						value={roleFilter}
						onValueChange={(v) => onRoleFilterChange(v as RoleFilterValue)}>
						<SelectTrigger
							id="role-filter"
							className="border-border bg-input min-h-10 w-[min(100%,220px)] sm:w-[240px]">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{ROLE_FILTER_OPTIONS.map((o) => (
								<SelectItem key={o.value} value={o.value}>
									{o.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<DataTableViewOptions table={table} />
			</div>
		</div>
	);
}
