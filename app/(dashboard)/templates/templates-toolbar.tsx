"use client";

import Link from "next/link";
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
import type { Department } from "@/queries/departments";

import type { TemplateTableRow } from "./map-template-row";

type TemplatesToolbarProps = {
	table: Table<TemplateTableRow>;
	departments: Department[];
	departmentFilter: string;
	onDepartmentFilterChange: (value: string) => void;
	roleFilter: string;
	onRoleFilterChange: (value: string) => void;
};

export function TemplatesToolbar({
	table,
	departments,
	departmentFilter,
	onDepartmentFilterChange,
	roleFilter,
	onRoleFilterChange,
}: TemplatesToolbarProps) {
	const isFiltered =
		table.getState().columnFilters.length > 0 ||
		Boolean(departmentFilter) ||
		Boolean(roleFilter.trim());

	return (
		<div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
			<div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
				<div className="grid min-w-0 flex-1 gap-2 sm:max-w-xs">
					<Label className="text-muted-foreground text-xs">Name</Label>
					<Input
						placeholder="Filter by name..."
						value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
						onChange={(event) => {
							table.getColumn("name")?.setFilterValue(event.target.value);
						}}
						className="w-full min-w-32"
					/>
				</div>
				<div className="grid w-full gap-2 sm:w-48">
					<Label className="text-muted-foreground text-xs">Department</Label>
					<Select
						value={departmentFilter || "all"}
						onValueChange={(v) =>
							onDepartmentFilterChange(v === "all" ? "" : v)
						}>
						<SelectTrigger className="bg-input border-border w-full">
							<SelectValue placeholder="All departments" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All departments</SelectItem>
							{departments.map((d) => (
								<SelectItem key={d._id} value={d._id}>
									{d.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div className="grid w-full gap-2 sm:w-40">
					<Label
						htmlFor="tpl-filter-role"
						className="text-muted-foreground text-xs">
						Role (exact)
					</Label>
					<Input
						id="tpl-filter-role"
						placeholder="e.g. SDM"
						value={roleFilter}
						onChange={(e) => onRoleFilterChange(e.target.value)}
						className="w-full"
					/>
				</div>
				{isFiltered && (
					<Button
						variant="ghost"
						size="sm"
						className="h-8 self-end px-2 lg:px-3"
						onClick={() => {
							table.resetColumnFilters();
							onDepartmentFilterChange("");
							onRoleFilterChange("");
						}}>
						Reset
						<X className="size-4" />
					</Button>
				)}
			</div>
			<div className="flex flex-wrap items-center gap-2">
				<DataTableViewOptions table={table} />
				<Button type="button" asChild>
					<Link href="/templates/new">New template</Link>
				</Button>
			</div>
		</div>
	);
}
