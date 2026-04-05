"use client";

import { useMemo } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DataTable } from "@/components/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { useListReportRuns } from "@/queries/reports";

import { getReportRunColumns } from "./report-runs-columns";
import { ReportRunsToolbar } from "./report-runs-toolbar";

export function ReportRunsDataTable() {
	const { data, isPending, isError, error, refetch } = useListReportRuns();
	const runs = data?.data?.reports ?? [];

	const columns = useMemo(() => getReportRunColumns(), []);

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
				<AlertTitle>Could not load report runs</AlertTitle>
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
		<DataTable
			columns={columns}
			data={runs}
			getRowId={(row) => row._id}
			defaultPageSize={10}
			emptyMessage="No report runs yet. Runs are generated when a KPI period locks or closes."
			renderToolbar={(table) => <ReportRunsToolbar table={table} />}
		/>
	);
}
