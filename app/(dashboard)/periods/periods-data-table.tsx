"use client";

import { useMemo, useState } from "react";

import { useAuth } from "@/components/providers/auth-provider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DataTable } from "@/components/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { isOrgAdminRole } from "@/lib/org-admin";
import { useListKpiPeriods } from "@/queries/periods";
import type { ListKpiPeriodsQuery, KpiPeriodStatus } from "@/queries/periods";

import { getPeriodColumns } from "./columns";
import {
	PeriodsAdminModals,
	type PeriodAdminModal,
} from "./periods-admin-modals";
import { PeriodsToolbar } from "./periods-toolbar";

function isStatusFilter(v: string): v is KpiPeriodStatus {
	return v === "active" || v === "locked" || v === "closed";
}

export function PeriodsDataTable() {
	const { session } = useAuth();
	const isOrgAdmin = isOrgAdminRole(session?.activeOrganizationRole);

	const [statusFilter, setStatusFilter] = useState("all");
	const [adminModal, setAdminModal] = useState<PeriodAdminModal>(null);

	const listParams = useMemo((): ListKpiPeriodsQuery => {
		return {
			page: 1,
			limit: 100,
			status:
				statusFilter !== "all" && isStatusFilter(statusFilter)
					? statusFilter
					: undefined,
		};
	}, [statusFilter]);

	const { data, isPending, isError, error, refetch } =
		useListKpiPeriods(listParams);

	const periods = data?.data?.docs ?? [];

	const columns = useMemo(
		() =>
			getPeriodColumns({
				isOrgAdmin,
				onPeriodAdmin: (action, period) =>
					setAdminModal({ type: action, period }),
			}),
		[isOrgAdmin],
	);

	if (isPending) {
		return (
			<div className="space-y-3">
				<Skeleton className="h-10 w-full max-w-sm" />
				<Skeleton className="h-64 w-full rounded-md" />
			</div>
		);
	}

	if (isError) {
		return (
			<Alert variant="destructive">
				<AlertTitle>Could not load periods</AlertTitle>
				<AlertDescription className="flex flex-col gap-2">
					<span>{error instanceof Error ? error.message : "Request failed"}</span>
					<button
						type="button"
						className="text-sm underline"
						onClick={() => void refetch()}>
						Retry
					</button>
				</AlertDescription>
			</Alert>
		);
	}

	return (
		<>
			<DataTable
				columns={columns}
				data={periods}
				getRowId={(row) => row._id}
				defaultPageSize={10}
				emptyMessage="No periods yet. Save configuration and start the period system to create the first cycle."
				renderToolbar={(table) => (
					<PeriodsToolbar
						table={table}
						statusFilter={statusFilter}
						onStatusFilterChange={setStatusFilter}
					/>
				)}
			/>
			<PeriodsAdminModals modal={adminModal} onDismiss={() => setAdminModal(null)} />
		</>
	);
}
