"use client";

import { Search, X } from "lucide-react";

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

export type ReportPeriodInsightsFiltersProps = {
	departments: Department[];
	departmentFilter: string;
	onDepartmentFilterChange: (value: string) => void;
	searchQuery: string;
	onSearchChange: (value: string) => void;
	roleQuery: string;
	onRoleChange: (value: string) => void;
	periodLabel: string;
};

export function ReportPeriodInsightsFilters({
	departments,
	departmentFilter,
	onDepartmentFilterChange,
	searchQuery,
	onSearchChange,
	roleQuery,
	onRoleChange,
	periodLabel,
}: ReportPeriodInsightsFiltersProps) {
	const isFiltered =
		Boolean(searchQuery.trim()) ||
		Boolean(departmentFilter) ||
		Boolean(roleQuery.trim());

	return (
		<div className="bg-card rounded-none border border-border/40 p-4 shadow-sm">
			<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
				<div className="grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
					<div className="grid min-w-0 gap-2 sm:col-span-2 lg:col-span-1 xl:col-span-2">
						<Label className="text-muted-foreground text-xs">
							Search members
						</Label>
						<div className="relative">
							<Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
							<Input
								placeholder="Name or employee id..."
								value={searchQuery}
								onChange={(e) => onSearchChange(e.target.value)}
								className="bg-input border-border pl-9"
							/>
						</div>
					</div>
					<div className="grid gap-2">
						<Label className="text-muted-foreground text-xs">
							Filter by department
						</Label>
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
					<div className="grid gap-2">
						<Label className="text-muted-foreground text-xs">
							Filter by role
						</Label>
						<Input
							placeholder="e.g. AE"
							value={roleQuery}
							onChange={(e) => onRoleChange(e.target.value)}
							className="bg-input border-border"
						/>
					</div>
					<div className="grid gap-2">
						<Label className="text-muted-foreground text-xs">Period</Label>
						<div className="bg-muted/50 text-foreground flex min-h-9 items-center rounded-md border border-border/60 px-3 text-sm">
							{periodLabel}
						</div>
					</div>
				</div>
				{isFiltered && (
					<Button
						type="button"
						variant="ghost"
						size="sm"
						className="h-8 self-end"
						onClick={() => {
							onSearchChange("");
							onRoleChange("");
							onDepartmentFilterChange("");
						}}>
						Reset
						<X className="size-4" />
					</Button>
				)}
			</div>
		</div>
	);
}
