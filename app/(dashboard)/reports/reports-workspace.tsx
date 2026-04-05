"use client";

import { ReportRunsDataTable } from "./report-runs-data-table";
import { OpenReportById } from "./open-report-by-id";

export function ReportsWorkspace() {
	return (
		<div className="space-y-8">
			<div>
				<h2 className="text-foreground mb-3 text-sm font-semibold tracking-tight">
					Report runs
				</h2>
				<p className="text-muted-foreground mb-4 max-w-2xl text-sm leading-relaxed">
					Each row is a generated report for a closed KPI period. Choose{" "}
					<strong className="text-foreground font-medium">View</strong> to open
					the full period insights page. Detail requires the period to be closed
					(otherwise you may see “not available yet”).
				</p>
				<ReportRunsDataTable />
			</div>

			<OpenReportById />
		</div>
	);
}
