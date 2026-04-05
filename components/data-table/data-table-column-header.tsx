"use client";

import type * as React from "react";
import { type Column } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronsUpDown, EyeOff } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type DataTableColumnHeaderProps<TData, TValue> =
	React.HTMLAttributes<HTMLDivElement> & {
		column: Column<TData, TValue>;
		title: string;
	};

export function DataTableColumnHeader<TData, TValue>({
	column,
	title,
	className,
}: DataTableColumnHeaderProps<TData, TValue>) {
	if (!column.getCanSort()) {
		return (
			<div className={cn("flex min-h-8 items-center text-sm font-medium", className)}>
				{title}
			</div>
		);
	}

	return (
		<div
			className={cn(
				"flex min-h-8 w-full max-w-full items-center justify-start",
				className,
			)}>
			<DropdownMenu modal={false}>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="sm"
						className="h-9 max-w-full gap-1.5 px-2 font-medium text-foreground hover:bg-muted/60 data-[state=open]:bg-muted/60">
						<span className="truncate">{title}</span>
						{column.getIsSorted() === "desc" ? (
							<ArrowDown className="size-4 shrink-0" />
						) : column.getIsSorted() === "asc" ? (
							<ArrowUp className="size-4 shrink-0" />
						) : (
							<ChevronsUpDown className="size-4 shrink-0 opacity-60" />
						)}
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					className="p-2"
					align="start"
					sideOffset={6}
					collisionPadding={8}>
					<DropdownMenuItem onClick={() => column.toggleSorting(false)}>
						<ArrowUp className="size-3.5 text-muted-foreground" />
						Asc
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => column.toggleSorting(true)}>
						<ArrowDown className="size-3.5 text-muted-foreground" />
						Desc
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
						<EyeOff className="size-3.5 text-muted-foreground" />
						Hide
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
