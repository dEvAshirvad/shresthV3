"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDecimal2, formatPercent2 } from "@/lib/number-format";
import { useSignOut } from "@/queries/auth";
import {
	useStaffMe,
	useStaffPeriodCohort,
	useStaffPeriods,
	useStaffPeriodSummary,
	type StaffCohortPeer,
} from "@/queries/staff";

function formatMarks(obtained: number, total: number) {
	if (!total) return formatDecimal2(obtained);
	const pct = (obtained / total) * 100;
	return `${formatDecimal2(obtained)} / ${formatDecimal2(total)} (${formatPercent2(pct)})`;
}

function PeerTable({
	title,
	peers,
}: {
	title: string;
	peers: StaffCohortPeer[];
}) {
	if (!peers.length) {
		return (
			<div>
				<h3 className="text-sm font-medium">{title}</h3>
				<p className="text-muted-foreground mt-2 text-sm">No peers in this band.</p>
			</div>
		);
	}

	return (
		<div>
			<h3 className="text-sm font-medium">{title}</h3>
			<div className="mt-2 overflow-x-auto rounded-md border">
				<table className="w-full min-w-[420px] text-left text-sm">
					<thead className="bg-muted/40 text-muted-foreground">
						<tr>
							<th className="px-3 py-2 font-medium">Rank</th>
							<th className="px-3 py-2 font-medium">Name</th>
							<th className="px-3 py-2 font-medium">Score</th>
						</tr>
					</thead>
					<tbody>
						{peers.map((p) => (
							<tr
								key={`${p.employeeId}-${p.rank}`}
								className={
									p.isSelf
										? "border-t bg-primary/5 font-medium"
										: "border-t"
								}>
								<td className="px-3 py-2 tabular-nums">{p.rank}</td>
								<td className="px-3 py-2">
									{p.employeeName || "—"}
									{p.isSelf ? (
										<span className="text-muted-foreground ml-2 text-xs">
											(you)
										</span>
									) : null}
								</td>
								<td className="px-3 py-2 tabular-nums">
									{formatMarks(p.obtainedMarks, p.totalMarks)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}

export default function StaffPage() {
	const router = useRouter();
	const { user } = useAuth();
	const signOut = useSignOut();
	const meQ = useStaffMe();
	const periodsQ = useStaffPeriods();

	const periods = periodsQ.data?.data?.periods ?? [];
	const [periodId, setPeriodId] = useState("");

	useEffect(() => {
		if (!periods.length) {
			setPeriodId("");
			return;
		}
		if (!periodId || !periods.some((p) => p.id === periodId)) {
			setPeriodId(periods[0]!.id);
		}
	}, [periods, periodId]);

	const summaryQ = useStaffPeriodSummary(periodId, {
		enabled: Boolean(periodId),
	});
	const cohortQ = useStaffPeriodCohort(periodId, {
		enabled: Boolean(periodId),
	});

	const me = meQ.data?.data?.me;
	const summary = summaryQ.data?.data?.summary;
	const cohort = cohortQ.data?.data?.cohort;
	const dept = summary?.department;

	const selectedPeriod = useMemo(
		() => periods.find((p) => p.id === periodId),
		[periods, periodId],
	);

	const loadingProfile = meQ.isPending || periodsQ.isPending;

	const handleSignOut = async () => {
		await signOut.mutateAsync(undefined);
		router.replace("/");
	};

	return (
		<div className="min-h-screen bg-muted/30">
			<header className="border-b bg-background">
				<div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
					<div>
						<p className="text-muted-foreground text-xs uppercase tracking-wide">
							Staff KPI
						</p>
						<h1 className="text-lg font-semibold tracking-tight">
							{me?.name || user?.name || "My performance"}
						</h1>
						{me ? (
							<p className="text-muted-foreground text-sm">
								{me.empId}
								{me.department?.name
									? ` · ${me.department.name}`
									: ""}
								{me.departmentRole ? ` · ${me.departmentRole}` : ""}
							</p>
						) : null}
					</div>
					<Button
						variant="secondary"
						onClick={() => {
							void handleSignOut();
						}}
						disabled={signOut.isPending}>
						Sign out
					</Button>
				</div>
			</header>

			<main className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6">
				{loadingProfile ? (
					<div className="space-y-3">
						<Skeleton className="h-10 w-64" />
						<Skeleton className="h-32 w-full" />
					</div>
				) : meQ.isError ? (
					<p className="text-destructive text-sm">
						Could not load your staff profile. Ask an admin to provision your
						employee credentials.
					</p>
				) : periods.length === 0 ? (
					<Card>
						<CardHeader>
							<CardTitle>No closed periods yet</CardTitle>
							<CardDescription>
								Your KPI scores appear here after a period is closed and
								reports are generated.
							</CardDescription>
						</CardHeader>
					</Card>
				) : (
					<>
						<div className="grid gap-2 max-w-sm">
							<Label htmlFor="staff-period">Period</Label>
							<Select value={periodId} onValueChange={setPeriodId}>
								<SelectTrigger id="staff-period">
									<SelectValue placeholder="Select period" />
								</SelectTrigger>
								<SelectContent>
									{periods.map((p) => (
										<SelectItem key={p.id} value={p.id}>
											{p.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="grid gap-4 sm:grid-cols-2">
							<Card>
								<CardHeader className="pb-2">
									<CardDescription>My score</CardDescription>
									<CardTitle className="text-2xl tabular-nums">
										{summaryQ.isPending
											? "…"
											: dept
												? formatMarks(dept.obtainedMarks, dept.totalMarks)
												: "—"}
									</CardTitle>
								</CardHeader>
								<CardContent className="text-muted-foreground text-sm">
									{selectedPeriod?.name ?? "Selected period"}
									{summary?.overall
										? ` · Overall rank ${summary.overall.rank}`
										: null}
								</CardContent>
							</Card>
							<Card>
								<CardHeader className="pb-2">
									<CardDescription>My rank</CardDescription>
									<CardTitle className="text-2xl tabular-nums">
										{summaryQ.isPending || cohortQ.isPending
											? "…"
											: dept && cohort
												? `${dept.rank} / ${cohort.cohortSize}`
												: dept
													? String(dept.rank)
													: "—"}
									</CardTitle>
								</CardHeader>
								<CardContent className="text-muted-foreground text-sm">
									Same department
									{cohort?.role ? ` · ${cohort.role}` : ""} cohort
								</CardContent>
							</Card>
						</div>

						{cohortQ.isPending ? (
							<Skeleton className="h-48 w-full" />
						) : cohortQ.isError ? (
							<p className="text-destructive text-sm">
								Could not load cohort comparison for this period.
							</p>
						) : cohort ? (
							<div className="grid gap-6 lg:grid-cols-2">
								<PeerTable title="Top 3" peers={cohort.top} />
								<PeerTable title="Bottom 3" peers={cohort.bottom} />
							</div>
						) : null}

						<section className="space-y-2">
							<h2 className="text-sm font-medium">History</h2>
							<div className="overflow-x-auto rounded-md border bg-background">
								<table className="w-full min-w-[480px] text-left text-sm">
									<thead className="bg-muted/40 text-muted-foreground">
										<tr>
											<th className="px-3 py-2 font-medium">Period</th>
											<th className="px-3 py-2 font-medium">Score</th>
											<th className="px-3 py-2 font-medium">Rank</th>
										</tr>
									</thead>
									<tbody>
										{periods.map((p) => (
											<tr
												key={p.id}
												className={
													p.id === periodId
														? "border-t bg-primary/5"
														: "border-t"
												}>
												<td className="px-3 py-2">
													<button
														type="button"
														className="text-left underline-offset-2 hover:underline"
														onClick={() => setPeriodId(p.id)}>
														{p.name}
													</button>
												</td>
												<td className="px-3 py-2 tabular-nums">
													{p.myScore
														? formatMarks(
																p.myScore.obtainedMarks,
																p.myScore.totalMarks,
															)
														: "—"}
												</td>
												<td className="px-3 py-2 tabular-nums">
													{p.myScore?.rank ?? "—"}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</section>
					</>
				)}
			</main>
		</div>
	);
}
