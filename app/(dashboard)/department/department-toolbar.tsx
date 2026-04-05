"use client";

import { type Table } from "@tanstack/react-table";
import { X } from "lucide-react";

import { DataTableFacetedFilter } from "@/components/data-table/data-table-faceted-filter";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { DepartmentImportDropdown } from "./department-import-dropdown";
import { nodalFilterOptions } from "./data/nodal-filter";
import type { DepartmentTableRow } from "./columns";

type DepartmentToolbarProps = {
	table: Table<DepartmentTableRow>;
	onAdd: () => void;
};

export function DepartmentToolbar({ table, onAdd }: DepartmentToolbarProps) {
	const isFiltered = table.getState().columnFilters.length > 0;

	return (
		<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<div className="flex flex-1 flex-wrap items-center gap-2">
				<Input
					placeholder="Filter departments..."
					value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
					onChange={(event) =>
						table.getColumn("name")?.setFilterValue(event.target.value)
					}
					className="w-full min-w-32 sm:max-w-sm"
				/>
				{table.getColumn("nodalStatus") && (
					<DataTableFacetedFilter
						column={table.getColumn("nodalStatus")}
						title="Nodal"
						options={[...nodalFilterOptions]}
					/>
				)}
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
				<DepartmentImportDropdown />
				<Button type="button" onClick={onAdd}>
					Add department
				</Button>
			</div>
		</div>
	);
}
