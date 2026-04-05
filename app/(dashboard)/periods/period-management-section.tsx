"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
	apiDateFieldToIstYmdForInput,
	formatIsoInstantInIst,
	isValidIstBusinessYmd,
	istBusinessYmdToUtcIsoInstant,
	istCurrentMonthFirstDayYmd,
} from "@/lib/business-date";
import { getApiErrorMessage } from "@/lib/api-error";
import {
	useKpiPeriodConfig,
	useStartKpiPeriods,
	useUpdateKpiPeriodConfig,
} from "@/queries/periods";

import { PeriodsDataTable } from "./periods-data-table";

function defaultAnchorDate(): string {
	const d = new Date();
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, "0");
	return `${y}-${m}-01`;
}

export function PeriodManagementSection() {
	const { session } = useAuth();
	const orgReady = Boolean(session?.activeOrganizationId);

	const { data: configRes, isPending: configLoading } =
		useKpiPeriodConfig(orgReady);
	const configSnapshot = configRes?.data?.config ?? null;

	const [frequencyMonths, setFrequencyMonths] = useState("1");
	const [lockingPeriodDays, setLockingPeriodDays] = useState("2");
	const [periodStartDate, setPeriodStartDate] = useState(() =>
		istCurrentMonthFirstDayYmd(),
	);

	const updateCfg = useUpdateKpiPeriodConfig();
	const startKpi = useStartKpiPeriods();

	const isStarted = Boolean(configSnapshot?.isStarted);

	useEffect(() => {
		if (!configSnapshot) return;
		setFrequencyMonths(String(configSnapshot.frequencyMonths));
		setLockingPeriodDays(String(configSnapshot.lockingPeriodDays));
		const pending = configSnapshot.pendingStartDate;
		if (pending) setPeriodStartDate(apiDateFieldToIstYmdForInput(pending));
	}, [configSnapshot]);

	const validateConfigForm = (requireStartDate: boolean) => {
		const fm = Number.parseInt(frequencyMonths, 10);
		const lp = Number.parseInt(lockingPeriodDays, 10);
		const start = periodStartDate.trim();
		if (!Number.isFinite(fm) || fm < 1) {
			toast.error("Frequency must be at least 1 month");
			return null;
		}
		if (!Number.isFinite(lp) || lp < 1) {
			toast.error("Locking window must be at least 1 day");
			return null;
		}
		if (requireStartDate) {
			if (!start) {
				toast.error("Choose an anchor date for the first period");
				return null;
			}
			if (!isValidIstBusinessYmd(start)) {
				toast.error("Invalid start date (use India business calendar)");
				return null;
			}
		}
		return { fm, lp, start };
	};

	const handleSaveConfig = async () => {
		if (isStarted) {
			const v = validateConfigForm(false);
			if (!v) return;
			try {
				const res = await updateCfg.mutateAsync({
					frequencyMonths: v.fm,
					lockingPeriodDays: v.lp,
				});
				toast.success(res.data.message ?? "Configuration saved");
			} catch (e) {
				toast.error(getApiErrorMessage(e));
			}
			return;
		}
		const v = validateConfigForm(true);
		if (!v) return;
		try {
			const res = await updateCfg.mutateAsync({
				frequencyMonths: v.fm,
				lockingPeriodDays: v.lp,
				startDate: istBusinessYmdToUtcIsoInstant(v.start, "noon"),
			});
			toast.success(res.data.message ?? "Configuration saved");
		} catch (e) {
			toast.error(getApiErrorMessage(e));
		}
	};

	const handleStartPipeline = async () => {
		const v = validateConfigForm(true);
		if (!v) return;
		try {
			await updateCfg.mutateAsync({
				frequencyMonths: v.fm,
				lockingPeriodDays: v.lp,
				startDate: istBusinessYmdToUtcIsoInstant(v.start, "noon"),
			});
			const res = await startKpi.mutateAsync();
			toast.success(res.data.message ?? "KPI period system started");
		} catch (e) {
			const msg = getApiErrorMessage(e);
			if (
				msg.includes("PERIOD_ALREADY_STARTED") ||
				msg.toLowerCase().includes("already")
			) {
				toast.message("Period system was already started");
			} else {
				toast.error(msg);
			}
		}
	};

	const busyConfig = updateCfg.isPending || startKpi.isPending;

	if (!orgReady) {
		return (
			<p className="text-muted-foreground text-sm">
				Select an active organization before managing KPI periods.
			</p>
		);
	}

	return (
		<div className="space-y-8">
			<div>
				<h2 className="text-foreground mb-3 text-sm font-semibold tracking-tight">
					Periods
				</h2>
				<p className="text-muted-foreground mb-4 max-w-2xl text-sm leading-relaxed">
					Org admins (owner, admin, nodal) use each row&apos;s menu: update end
					date and force lock only for an active period; generate reports for a
					locked period. Closed periods show no admin actions (copy ID still
					available).
				</p>
				<PeriodsDataTable />
			</div>

			<Card className="rounded-none border border-border/40 bg-card">
				<CardHeader>
					<CardTitle className="text-base">Configuration snapshot</CardTitle>
					<CardDescription>
						Loaded from{" "}
						<code className="rounded bg-muted px-1 text-xs">GET /periods/config</code>
						; updates after save or start.
					</CardDescription>
				</CardHeader>
				<CardContent className="text-muted-foreground space-y-2 text-sm">
					{configLoading && !configSnapshot ? (
						<Skeleton className="h-20 w-full max-w-md" />
					) : configSnapshot ? (
						<ul className="space-y-1 font-mono text-xs">
							<li>
								<span className="text-foreground">Started:</span>{" "}
								{configSnapshot.isStarted ? "yes" : "no"}
							</li>
							{configSnapshot.startedAt ? (
								<li>
									<span className="text-foreground">Started at:</span>{" "}
									{configSnapshot.startedAt}
								</li>
							) : null}
							{configSnapshot.pendingStartDate ? (
								<li>
									<span className="text-foreground">Pending anchor:</span>{" "}
									{configSnapshot.pendingStartDate.includes("T")
										? formatIsoInstantInIst(configSnapshot.pendingStartDate)
										: configSnapshot.pendingStartDate}
								</li>
							) : null}
							<li>
								<span className="text-foreground">Frequency:</span>{" "}
								{configSnapshot.frequencyMonths} mo ·{" "}
								<span className="text-foreground">Lock window:</span>{" "}
								{configSnapshot.lockingPeriodDays} d
							</li>
						</ul>
					) : (
						<p>No configuration saved yet. Use the form below.</p>
					)}
				</CardContent>
			</Card>

			<Card className="rounded-none border border-border/40 bg-card">
				<CardHeader>
					<CardTitle className="text-base">Configuration</CardTitle>
					<CardDescription>
						Before the system starts, every save must include frequency, locking
						window, and anchor date. After start, only frequency and locking can
						be changed, and only while the latest period is locked.
					</CardDescription>
				</CardHeader>
				<CardContent className="flex max-w-xl flex-col gap-4">
					{!isStarted ? (
						<div className="grid gap-2">
							<Label htmlFor="pm-anchor">First period anchor</Label>
							<Input
								id="pm-anchor"
								type="date"
								value={periodStartDate}
								onChange={(e) => setPeriodStartDate(e.target.value)}
							/>
							<p className="text-muted-foreground text-xs">
								India business date (Asia/Kolkata); saved as a UTC instant.
							</p>
						</div>
					) : (
						<p className="text-muted-foreground text-sm">
							Anchor date is fixed after start. Adjust frequency and locking
							only when policy allows (latest period locked).
						</p>
					)}
					<div className="grid gap-2">
						<Label htmlFor="pm-freq">Frequency (months)</Label>
						<Input
							id="pm-freq"
							type="number"
							min={1}
							value={frequencyMonths}
							onChange={(e) => setFrequencyMonths(e.target.value)}
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="pm-lock">Locking window (days)</Label>
						<Input
							id="pm-lock"
							type="number"
							min={1}
							value={lockingPeriodDays}
							onChange={(e) => setLockingPeriodDays(e.target.value)}
						/>
					</div>
				</CardContent>
				<CardFooter className="flex flex-wrap gap-2 pb-6">
					<Button
						type="button"
						disabled={busyConfig}
						onClick={() => void handleSaveConfig()}>
						Save configuration
					</Button>
					{!isStarted ? (
						<Button
							type="button"
							variant="secondary"
							disabled={busyConfig}
							onClick={() => void handleStartPipeline()}>
							Save &amp; start period system
						</Button>
					) : null}
				</CardFooter>
			</Card>
		</div>
	);
}
