import type { ReportRankingRow } from "@/queries/reports";

export type ReportRankingTableRow = ReportRankingRow & {
	departmentLabel: string;
	scorePercent: number;
};

export function mapReportRankingRow(
	row: ReportRankingRow,
	deptNameById: Map<string, string>,
): ReportRankingTableRow {
	const total = row.totalMarks > 0 ? row.totalMarks : 1;
	const scorePercent = (row.obtainedMarks / total) * 100;
	return {
		...row,
		departmentLabel: deptNameById.get(row.departmentId) ?? row.departmentId,
		scorePercent,
	};
}
