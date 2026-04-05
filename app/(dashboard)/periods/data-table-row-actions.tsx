"use client";

import { type Row } from "@tanstack/react-table";
import {
	CalendarClock,
	Copy,
	Lock,
	MoreHorizontal,
	RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { KpiPeriodDocument, KpiPeriodStatus } from "@/queries/periods";

type PeriodAdminAction = "periodDates" | "forceLock" | "reports";

type PeriodDataTableRowActionsProps = {
	row: Row<KpiPeriodDocument>;
	isOrgAdmin: boolean;
	onPeriodAdmin: (action: PeriodAdminAction, period: KpiPeriodDocument) => void;
};

function adminActionsForStatus(
	status: KpiPeriodStatus,
): PeriodAdminAction[] {
	if (status === "active") return ["periodDates", "forceLock"];
	if (status === "locked") return ["reports"];
	return [];
}

export function PeriodDataTableRowActions({
	row,
	isOrgAdmin,
	onPeriodAdmin,
}: PeriodDataTableRowActionsProps) {
	const period = row.original;
	const adminItems = isOrgAdmin ? adminActionsForStatus(period.status) : [];

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="size-8 data-[state=open]:bg-muted">
					<span className="sr-only">Open menu</span>
					<MoreHorizontal className="size-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-[220px]">
				<DropdownMenuItem
					className="gap-2"
					onClick={() => {
						void navigator.clipboard.writeText(period._id);
						toast.success("Period ID copied");
					}}>
					<Copy className="size-4" />
					Copy period ID
				</DropdownMenuItem>
				{adminItems.length > 0 ? <DropdownMenuSeparator /> : null}
				{adminItems.includes("periodDates") ? (
					<DropdownMenuItem
						className="gap-2"
						onClick={() => onPeriodAdmin("periodDates", period)}>
						<CalendarClock className="size-4" />
						Adjust period dates
					</DropdownMenuItem>
				) : null}
				{adminItems.includes("forceLock") ? (
					<DropdownMenuItem
						className="gap-2 text-destructive focus:text-destructive"
						onClick={() => onPeriodAdmin("forceLock", period)}>
						<Lock className="size-4" />
						Force lock &amp; roll
					</DropdownMenuItem>
				) : null}
				{adminItems.includes("reports") ? (
					<DropdownMenuItem
						className="gap-2"
						onClick={() => onPeriodAdmin("reports", period)}>
						<RefreshCw className="size-4" />
						Generate reports
					</DropdownMenuItem>
				) : null}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
