"use client";

import * as React from "react";
import {
	flexRender,
	getCoreRowModel,
	getFacetedRowModel,
	getFacetedUniqueValues,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
	type ColumnDef,
	type ColumnFiltersState,
	type SortingState,
	type Table as TanstackTable,
	type VisibilityState,
} from "@tanstack/react-table";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

import { DataTablePagination } from "./data-table-pagination";

type DataTableProps<TData, TValue> = {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	getRowId?: (originalRow: TData, index: number) => string;
	/** Tasks-style toolbar (filters, view, actions) */
	renderToolbar?: (table: TanstackTable<TData>) => React.ReactNode;
	/** e.g. hide filter-only columns: `{ nodalStatus: false }` */
	initialColumnVisibility?: VisibilityState;
	/** Default page size (tasks example uses 25; we use 10 for department) */
	defaultPageSize?: number;
	emptyMessage?: string;
	/** Extra classes per row (e.g. highlight selected detail row). */
	getRowClassName?: (row: TData) => string | undefined;
	showPagination?: boolean;
};

export function DataTable<TData, TValue>({
	columns,
	data,
	getRowId,
	renderToolbar,
	initialColumnVisibility,
	defaultPageSize = 10,
	emptyMessage = "No results.",
	getRowClassName,
	showPagination = true,
}: DataTableProps<TData, TValue>) {
	const [rowSelection, setRowSelection] = React.useState({});
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>(initialColumnVisibility ?? {});
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	);
	const [sorting, setSorting] = React.useState<SortingState>([]);

	const table = useReactTable({
		data,
		columns,
		state: {
			sorting,
			columnVisibility,
			rowSelection,
			columnFilters,
		},
		initialState: {
			pagination: {
				pageSize: defaultPageSize,
			},
		},
		enableRowSelection: true,
		onRowSelectionChange: setRowSelection,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
		getRowId,
	});

	return (
		<div className="flex w-full flex-col gap-4">
			{renderToolbar?.(table)}
			<div className="rounded-none border border-border/40 bg-card">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id} className="hover:bg-transparent">
								{headerGroup.headers.map((header) => (
									<TableHead
										key={header.id}
										colSpan={header.colSpan}
										className="h-auto min-h-11 px-3 py-2 align-middle [&:has([role=checkbox])]:w-10 [&:has([role=checkbox])]:pr-0">
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext(),
												)}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && "selected"}
									className={cn(getRowClassName?.(row.original))}>
									{row.getVisibleCells().map((cell) => (
										<TableCell
											className="px-5 py-2 h-14 align-middle [&:has([role=checkbox])]:pr-0"
											key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center text-muted-foreground">
									{emptyMessage}
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			{showPagination && <DataTablePagination table={table} />}
		</div>
	);
}
