"use client";

import { useMemo, useState } from "react";
import type { PaginationState } from "@tanstack/react-table";
import {
	Award,
	BarChart3,
	Building2,
	LayoutGrid,
	TrendingUp,
	Trophy,
	Users,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DataTable } from "@/components/data-table";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDecimal2, formatPercent2 } from "@/lib/number-format";
import { reportNotReadyMessage } from "@/lib/report-not-ready";
import { useOrgDepartments } from "@/hooks/use-org-departments";
import {
	useListReportRuns,
	useDepartmentRoleStats,
	useReportRanking,
	useReportSummary,
	type ReportDepartmentRole,
	type RankingScope,
} from "@/queries/reports";

import { getReportRankingColumns } from "./report-ranking-columns";
import {
	mapReportRankingRow,
	type ReportRankingTableRow,
} from "./map-report-ranking-row";
import { ReportPeriodInsightsFilters } from "./report-period-insights-filters";

type ReportPeriodInsightsProps = {
	periodId: string;
};

function formatPeriodLabel(periodKey: string | undefined): string {
	if (!periodKey) return "—";
	const d = new Date(periodKey);
	if (!Number.isNaN(d.getTime())) {
		return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
	}
	return periodKey;
}

function aggregateDepartments(
	stats: ReportDepartmentRole[],
	deptNameById: Map<string, string>,
) {
	const byDept = new Map<string, ReportDepartmentRole[]>();
	for (const s of stats) {
		const list = byDept.get(s.departmentId) ?? [];
		list.push(s);
		byDept.set(s.departmentId, list);
	}
	return Array.from(byDept.entries()).map(([departmentId, rows]) => {
		const totalEntries = rows.reduce((a, r) => a + (r.employees ?? 0), 0);
		const weights = rows.reduce(
			(a, r) => a + (r.avgObtainedMarks ?? 0) * (r.employees ?? 0),
			0,
		);
		const avgScore = totalEntries > 0 ? weights / totalEntries : 0;
		const avgs = rows.map((r) => r.avgObtainedMarks ?? 0);
		const maxScore = avgs.length ? Math.max(...avgs) : 0;
		const minScore = avgs.length ? Math.min(...avgs) : 0;
		return {
			departmentId,
			name: deptNameById.get(departmentId) ?? departmentId,
			totalEntries,
			avgScore,
			maxScore,
			minScore,
		};
	});
}

function scoreBuckets(rows: ReportRankingTableRow[]) {
	let excellent = 0;
	let good = 0;
	let average = 0;
	let poor = 0;
	for (const r of rows) {
		const p = r.scorePercent;
		if (p >= 80) excellent++;
		else if (p >= 60) good++;
		else if (p >= 40) average++;
		else poor++;
	}
	return { excellent, good, average, poor };
}

function filterRankingRows(
	rows: ReportRankingTableRow[],
	searchQuery: string,
	roleQuery: string,
): ReportRankingTableRow[] {
	const q = searchQuery.toLowerCase().trim();
	const rq = roleQuery.toLowerCase().trim();
	return rows.filter((r) => {
		if (q) {
			const name = (r.employeeName ?? "").toLowerCase();
			const id = String(r.employeeId).toLowerCase();
			if (!name.includes(q) && !id.includes(q)) return false;
		}
		if (rq) {
			const role = String(r.role ?? "").toLowerCase();
			if (!role.includes(rq)) return false;
		}
		return true;
	});
}

export function ReportPeriodInsights({ periodId }: ReportPeriodInsightsProps) {
	const [departmentFilter, setDepartmentFilter] = useState("");
	const [searchQuery, setSearchQuery] = useState("");
	const [roleQuery, setRoleQuery] = useState("");
	const [rankingPagination, setRankingPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 50,
	});

	const { data: listRes } = useListReportRuns();
	const runs = listRes?.data?.reports ?? [];
	const selectedRun = useMemo(
		() => runs.find((r) => r.periodId === periodId),
		[runs, periodId],
	);

	const { data: deptRes } = useOrgDepartments({ page: 1, limit: 200 });
	const departments = deptRes?.data?.docs ?? [];
	const deptNameById = useMemo(() => {
		const m = new Map<string, string>();
		for (const d of departments) m.set(d._id, d.name);
		return m;
	}, [departments]);

	const summaryQuery = useReportSummary(periodId);
	const allStatsQuery = useDepartmentRoleStats(periodId, {});

	const rankingScope: RankingScope = departmentFilter
		? "department"
		: "overall";
	const rankingQuery = useReportRanking(periodId, rankingScope, {
		departmentId:
			rankingScope === "department" ? departmentFilter : undefined,
		page: rankingPagination.pageIndex + 1,
		limit: rankingPagination.pageSize,
	});

	const summaryNotReady = reportNotReadyMessage(summaryQuery.error);
	const statsNotReady = reportNotReadyMessage(allStatsQuery.error);
	const rankingNotReady = reportNotReadyMessage(rankingQuery.error);

	const runStatus =
		summaryQuery.data?.data?.run?.status ??
		selectedRun?.status ??
		"generated";

	const tableRows = useMemo(() => {
		const docs = rankingQuery.data?.data?.docs;
		if (!docs?.length) return [];
		return docs.map((d) => mapReportRankingRow(d, deptNameById));
	}, [rankingQuery.data, deptNameById]);

	const filteredRows = useMemo(
		() => filterRankingRows(tableRows, searchQuery, roleQuery),
		[tableRows, searchQuery, roleQuery],
	);

	const sortedFilteredRows = useMemo(() => {
		return [...filteredRows].sort((a, b) => a.rank - b.rank);
	}, [filteredRows]);

	const columns = useMemo(
		() => getReportRankingColumns({ runStatus }),
		[runStatus],
	);

	const stats = allStatsQuery.data?.data?.stats ?? [];
	const departmentSummaries = useMemo(
		() => aggregateDepartments(stats, deptNameById),
		[stats, deptNameById],
	);

	const visibleDeptCards = useMemo(() => {
		if (!departmentFilter) return departmentSummaries;
		return departmentSummaries.filter((d) => d.departmentId === departmentFilter);
	}, [departmentSummaries, departmentFilter]);

	const orgWide = useMemo(() => {
		const totalEntries = stats.reduce((a, s) => a + (s.employees ?? 0), 0);
		const deptIds = new Set(stats.map((s) => s.departmentId));
		const roles = new Set(stats.map((s) => s.role).filter(Boolean));
		return {
			totalEntries,
			departmentCount: deptIds.size,
			roleCount: roles.size,
		};
	}, [stats]);

	const performance = useMemo(() => {
		if (!filteredRows.length) {
			return {
				avgPct: 0,
				count: 0,
				excellent: 0,
				poor: 0,
				buckets: { excellent: 0, good: 0, average: 0, poor: 0 },
			};
		}
		const sumPct = filteredRows.reduce((a, r) => a + r.scorePercent, 0);
		const buckets = scoreBuckets(filteredRows);
		const excellent = filteredRows.filter((r) => r.scorePercent >= 80).length;
		const poor = filteredRows.filter((r) => r.scorePercent < 40).length;
		return {
			avgPct: sumPct / filteredRows.length,
			count: filteredRows.length,
			excellent,
			poor,
			buckets,
		};
	}, [filteredRows]);

	const topPerformer = sortedFilteredRows[0];
	const bottomPerformer = sortedFilteredRows.length
		? sortedFilteredRows[sortedFilteredRows.length - 1]
		: null;

	const periodLabel = formatPeriodLabel(
		selectedRun?.periodKey ?? summaryQuery.data?.data?.run?.periodKey,
	);

	const loading =
		summaryQuery.isPending ||
		allStatsQuery.isPending ||
		rankingQuery.isPending;

	if (loading) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-24 w-full rounded-md" />
				<Skeleton className="h-32 w-full rounded-md" />
				<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
					{[1, 2, 3, 4].map((i) => (
						<Skeleton key={i} className="h-24 w-full rounded-md" />
					))}
				</div>
				<Skeleton className="h-64 w-full rounded-md" />
			</div>
		);
	}

	if (summaryNotReady || statsNotReady || rankingNotReady) {
		const msg =
			summaryNotReady ?? statsNotReady ?? rankingNotReady ?? "Unavailable";
		return (
			<Alert>
				<AlertTitle>Not available yet</AlertTitle>
				<AlertDescription>{msg}</AlertDescription>
			</Alert>
		);
	}

	if (
		summaryQuery.isError ||
		allStatsQuery.isError ||
		rankingQuery.isError
	) {
		return (
			<p className="text-destructive text-sm">
				Failed to load period insights. Try again later.
			</p>
		);
	}

	const rankingTotalRows = rankingQuery.data?.data?.total ?? filteredRows.length;

	const rankingTitle = departmentFilter
		? `${(deptNameById.get(departmentFilter) ?? "Department").toUpperCase()} PERFORMANCE RANKINGS (${rankingTotalRows})`
		: `ORGANIZATION PERFORMANCE RANKINGS (${rankingTotalRows})`;

	return (
		<div className="space-y-6">
			<div className="text-muted-foreground border-border flex flex-wrap items-center justify-between gap-2 border-b pb-3 text-sm">
				{selectedRun ? (
					<p>
						<span className="text-foreground font-medium">
							{selectedRun.periodKey}
						</span>{" "}
						· {selectedRun.status} ·{" "}
						{new Date(selectedRun.generatedAt).toLocaleString()}
					</p>
				) : (
					<p>
						Period{" "}
						<code className="text-foreground rounded bg-muted px-1 font-mono text-xs">
							{periodId}
						</code>{" "}
						— detail loaded when the report run exists.
					</p>
				)}
			</div>

			<ReportPeriodInsightsFilters
				departments={departments}
				departmentFilter={departmentFilter}
				onDepartmentFilterChange={(value) => {
					setDepartmentFilter(value);
					setRankingPagination((prev) => ({ ...prev, pageIndex: 0 }));
				}}
				searchQuery={searchQuery}
				onSearchChange={(value) => {
					setSearchQuery(value);
					setRankingPagination((prev) => ({ ...prev, pageIndex: 0 }));
				}}
				roleQuery={roleQuery}
				onRoleChange={(value) => {
					setRoleQuery(value);
					setRankingPagination((prev) => ({ ...prev, pageIndex: 0 }));
				}}
				periodLabel={periodLabel}
			/>

			<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
				<Card className="rounded-none border-emerald-200/80 bg-emerald-50/90 dark:border-emerald-900/50 dark:bg-emerald-950/40">
					<CardContent className="pt-5">
						<p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
							Total entries
						</p>
						<p className="mt-1 text-3xl font-semibold tabular-nums text-emerald-800 dark:text-emerald-200">
							{orgWide.totalEntries}
						</p>
					</CardContent>
				</Card>
				<Card className="rounded-none border-sky-200/80 bg-sky-50/90 dark:border-sky-900/50 dark:bg-sky-950/40">
					<CardContent className="pt-5">
						<p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
							Total departments
						</p>
						<p className="mt-1 text-3xl font-semibold tabular-nums text-sky-800 dark:text-sky-200">
							{orgWide.departmentCount}
						</p>
					</CardContent>
				</Card>
				<Card className="rounded-none border-amber-200/80 bg-amber-50/90 dark:border-amber-900/50 dark:bg-amber-950/40">
					<CardContent className="pt-5">
						<p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
							Total roles
						</p>
						<p className="mt-1 text-3xl font-semibold tabular-nums text-amber-900 dark:text-amber-100">
							{orgWide.roleCount}
						</p>
					</CardContent>
				</Card>
				<Card className="rounded-none border-border/60 bg-card">
					<CardContent className="pt-5">
						<p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
							Period
						</p>
						<p className="text-foreground mt-1 text-lg font-semibold leading-snug">
							{periodLabel}
						</p>
					</CardContent>
				</Card>
			</div>

			<section className="space-y-3">
				<div className="bg-violet-700 text-violet-50 dark:bg-violet-950 dark:text-violet-100 flex items-center gap-2 rounded-sm px-4 py-2.5">
					<LayoutGrid className="size-4 shrink-0 opacity-90" />
					<h3 className="text-sm font-semibold tracking-tight">
						Department-wise statistics
					</h3>
				</div>
				<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
					{visibleDeptCards.length === 0 ? (
						<p className="text-muted-foreground col-span-full text-sm">
							No department aggregates for this period.
						</p>
					) : (
						visibleDeptCards.map((d) => (
							<Card
								key={d.departmentId}
								className="rounded-none border-border/50 bg-card shadow-sm">
								<CardContent className="pt-4">
									<p className="text-foreground mb-3 text-sm font-semibold leading-tight">
										{d.name}
									</p>
									<dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
										<dt className="text-muted-foreground">Total entries</dt>
										<dd className="text-end tabular-nums">{d.totalEntries}</dd>
										<dt className="text-muted-foreground">Average score</dt>
										<dd className="text-end font-semibold text-sky-600 tabular-nums dark:text-sky-400">
											{formatDecimal2(d.avgScore)}
										</dd>
										<dt className="text-muted-foreground">Max score</dt>
										<dd className="text-end font-semibold text-emerald-600 tabular-nums dark:text-emerald-400">
											{formatDecimal2(d.maxScore)}
										</dd>
										<dt className="text-muted-foreground">Min score</dt>
										<dd className="text-end font-semibold text-amber-600 tabular-nums dark:text-amber-400">
											{formatDecimal2(d.minScore)}
										</dd>
									</dl>
								</CardContent>
							</Card>
						))
					)}
				</div>
			</section>

			<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
				<Card className="rounded-none border-emerald-200/70 bg-emerald-50/80 dark:border-emerald-900/40 dark:bg-emerald-950/30">
					<CardContent className="flex items-center gap-3 pt-5">
						<div className="flex size-10 items-center justify-center rounded-full bg-emerald-600/15 text-emerald-700 dark:text-emerald-300">
							<TrendingUp className="size-5" />
						</div>
						<div>
							<p className="text-muted-foreground text-xs uppercase">Average score</p>
							<p className="text-lg font-semibold tabular-nums text-emerald-700 dark:text-emerald-300">
								{formatPercent2(performance.avgPct)}
							</p>
						</div>
					</CardContent>
				</Card>
				<Card className="rounded-none border-sky-200/70 bg-sky-50/80 dark:border-sky-900/40 dark:bg-sky-950/30">
					<CardContent className="flex items-center gap-3 pt-5">
						<div className="flex size-10 items-center justify-center rounded-full bg-sky-600/15 text-sky-700 dark:text-sky-300">
							<Users className="size-5" />
						</div>
						<div>
							<p className="text-muted-foreground text-xs uppercase">
								Total entries (view)
							</p>
							<p className="text-lg font-semibold tabular-nums text-sky-800 dark:text-sky-200">
								{performance.count}
							</p>
						</div>
					</CardContent>
				</Card>
				<Card className="rounded-none border-amber-200/70 bg-amber-50/80 dark:border-amber-900/40 dark:bg-amber-950/30">
					<CardContent className="flex items-center gap-3 pt-5">
						<div className="flex size-10 items-center justify-center rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-200">
							<Trophy className="size-5" />
						</div>
						<div>
							<p className="text-muted-foreground text-xs uppercase">
								Excellent performers
							</p>
							<p className="text-lg font-semibold tabular-nums text-amber-900 dark:text-amber-100">
								{performance.excellent}
							</p>
						</div>
					</CardContent>
				</Card>
				<Card className="rounded-none border-slate-200/80 bg-slate-50/90 dark:border-slate-800 dark:bg-slate-950/40">
					<CardContent className="flex items-center gap-3 pt-5">
						<div className="flex size-10 items-center justify-center rounded-full bg-slate-500/15 text-slate-700 dark:text-slate-300">
							<Award className="size-5" />
						</div>
						<div>
							<p className="text-muted-foreground text-xs uppercase">
								Poor performers
							</p>
							<p className="text-lg font-semibold tabular-nums text-slate-800 dark:text-slate-200">
								{performance.poor}
							</p>
						</div>
					</CardContent>
				</Card>
			</div>

			<section className="space-y-2">
				<div className="bg-violet-700 text-violet-50 dark:bg-violet-950 dark:text-violet-100 flex items-center gap-2 rounded-sm px-4 py-2.5">
					<BarChart3 className="size-4 shrink-0 opacity-90" />
					<h3 className="text-sm font-semibold tracking-tight">
						Score distribution
					</h3>
				</div>
				<Card className="rounded-none border-border/50 bg-card">
					<CardContent className="grid gap-4 pt-5 sm:grid-cols-4">
						<div className="text-center">
							<p className="text-muted-foreground text-xs uppercase">Excellent</p>
							<p className="text-2xl font-semibold text-emerald-600 tabular-nums dark:text-emerald-400">
								{performance.buckets.excellent}
							</p>
							<p className="text-muted-foreground mt-0.5 text-[0.65rem]">≥ 80%</p>
						</div>
						<div className="text-center">
							<p className="text-muted-foreground text-xs uppercase">Good</p>
							<p className="text-2xl font-semibold text-sky-600 tabular-nums dark:text-sky-400">
								{performance.buckets.good}
							</p>
							<p className="text-muted-foreground mt-0.5 text-[0.65rem]">60–79%</p>
						</div>
						<div className="text-center">
							<p className="text-muted-foreground text-xs uppercase">Average</p>
							<p className="text-2xl font-semibold text-amber-600 tabular-nums dark:text-amber-400">
								{performance.buckets.average}
							</p>
							<p className="text-muted-foreground mt-0.5 text-[0.65rem]">40–59%</p>
						</div>
						<div className="text-center">
							<p className="text-muted-foreground text-xs uppercase">Poor</p>
							<p className="text-2xl font-semibold text-rose-600 tabular-nums dark:text-rose-400">
								{performance.buckets.poor}
							</p>
							<p className="text-muted-foreground mt-0.5 text-[0.65rem]">&lt; 40%</p>
						</div>
					</CardContent>
				</Card>
			</section>

			<section className="space-y-4">
				<div className="rounded-sm border border-sky-200/60 bg-linear-to-r from-sky-600/10 to-transparent px-4 py-3 dark:border-sky-900/50">
					<div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
						<div>
							<p className="text-foreground flex items-center gap-2 text-sm font-semibold">
								<Building2 className="size-4 text-sky-600 dark:text-sky-400" />
								Overall KPI statistics report
							</p>
							<p className="text-muted-foreground mt-0.5 max-w-2xl text-xs leading-relaxed">
								Comprehensive performance analysis across departments. Rankings
								reflect the selected period report snapshot.
							</p>
						</div>
						<span className="text-muted-foreground shrink-0 text-xs font-medium">
							Overall statistics: current period
						</span>
					</div>
				</div>

				{topPerformer && (
					<div>
						<div className="bg-emerald-800 text-emerald-50 dark:bg-emerald-950 dark:text-emerald-100 mb-2 rounded-sm px-4 py-2 text-sm font-semibold">
							Top performer
						</div>
						<Card className="rounded-none border-border/50 bg-card">
							<CardContent className="flex flex-wrap items-center justify-between gap-3 pt-5">
								<div>
									<p className="font-semibold">
										{topPerformer.employeeName ?? "—"}
									</p>
									<p className="text-muted-foreground text-xs">
										{topPerformer.departmentLabel} · {topPerformer.role ?? "—"}
									</p>
								</div>
								<span className="bg-emerald-600/15 text-emerald-800 dark:text-emerald-200 rounded-full px-3 py-1 text-sm font-semibold tabular-nums">
									{formatPercent2(topPerformer.scorePercent)}
								</span>
							</CardContent>
						</Card>
					</div>
				)}

				<div>
					<div className="bg-slate-900 text-slate-50 dark:bg-slate-950 dark:text-slate-100 mb-2 rounded-sm px-4 py-2 text-sm font-semibold tracking-wide">
						{rankingTitle}
					</div>
					<DataTable<ReportRankingTableRow, unknown>
						columns={columns}
						data={filteredRows}
						getRowId={(row) =>
							`${row.employeeId}-${row.rank}-${row.scope ?? rankingScope}`
						}
						pagination={{
							pageIndex: rankingPagination.pageIndex,
							pageSize: rankingPagination.pageSize,
							pageCount: rankingQuery.data?.data?.totalPages ?? 1,
							totalRows: rankingQuery.data?.data?.total ?? 0,
						}}
						onPaginationChange={setRankingPagination}
						emptyMessage="No ranking rows match your filters."
						renderToolbar={(table) => (
							<div className="flex justify-end">
								<DataTableViewOptions table={table} />
							</div>
						)}
					/>
				</div>

				{bottomPerformer && sortedFilteredRows.length > 1 && (
					<div>
						<div className="bg-emerald-800 text-emerald-50 dark:bg-emerald-950 dark:text-emerald-100 mb-2 rounded-sm px-4 py-2 text-sm font-semibold">
							Bottom performer
						</div>
						<Card className="rounded-none border-border/50 bg-card">
							<CardContent className="flex flex-wrap items-center justify-between gap-3 pt-5">
								<div>
									<p className="font-semibold">
										{bottomPerformer.employeeName ?? "—"}
									</p>
									<p className="text-muted-foreground text-xs">
										{bottomPerformer.departmentLabel} ·{" "}
										{bottomPerformer.role ?? "—"}
									</p>
								</div>
								<span className="bg-slate-600/15 text-slate-800 dark:text-slate-200 rounded-full px-3 py-1 text-sm font-semibold tabular-nums">
									{formatPercent2(bottomPerformer.scorePercent)}
								</span>
							</CardContent>
						</Card>
					</div>
				)}
			</section>
		</div>
	);
}
