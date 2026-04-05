"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	apiDateFieldToIstYmdForInput,
	istBusinessYmdToUtcIsoInstant,
} from "@/lib/business-date";
import { getApiErrorMessage } from "@/lib/api-error";
import type { KpiPeriodDocument } from "@/queries/periods";
import {
	useForceLockKpiPeriod,
	useGenerateKpiPeriodReports,
	useUpdateKpiPeriodDates,
} from "@/queries/periods";

export type PeriodAdminModal =
	| { type: "periodDates"; period: KpiPeriodDocument }
	| { type: "forceLock"; period: KpiPeriodDocument }
	| { type: "reports"; period: KpiPeriodDocument }
	| null;

type PeriodsAdminModalsProps = {
	modal: PeriodAdminModal;
	onDismiss: () => void;
};

function ymdToApiInstant(ymd: string) {
	const t = ymd.trim();
	if (!t) return "";
	return t.includes("T") ? t : istBusinessYmdToUtcIsoInstant(t, "noon");
}

export function PeriodsAdminModals({ modal, onDismiss }: PeriodsAdminModalsProps) {
	const patchDates = useUpdateKpiPeriodDates();
	const forceLockMut = useForceLockKpiPeriod();
	const genReportsMut = useGenerateKpiPeriodReports();

	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [initialStartYmd, setInitialStartYmd] = useState("");
	const [initialEndYmd, setInitialEndYmd] = useState("");
	const [reportsForce, setReportsForce] = useState(false);

	useEffect(() => {
		if (!modal) return;
		if (modal.type === "periodDates") {
			const s = apiDateFieldToIstYmdForInput(modal.period.startDate);
			const e = apiDateFieldToIstYmdForInput(modal.period.endDate);
			setStartDate(s);
			setEndDate(e);
			setInitialStartYmd(s);
			setInitialEndYmd(e);
		}
		if (modal.type === "reports") {
			setReportsForce(false);
		}
	}, [modal]);

	const close = () => onDismiss();

	const handleUpdatePeriodDates = async () => {
		if (!modal || modal.type !== "periodDates") return;
		const start = startDate.trim();
		const end = endDate.trim();
		if (!end) {
			toast.error("End date is required");
			return;
		}
		const body: {
			periodId: string;
			startDate?: string;
			endDate?: string;
		} = { periodId: modal.period._id };

		if (start !== initialStartYmd) {
			const iso = ymdToApiInstant(start);
			if (!iso) {
				toast.error("Choose a valid start date");
				return;
			}
			body.startDate = iso;
		}
		if (end !== initialEndYmd) {
			body.endDate = ymdToApiInstant(end);
		}
		if (body.startDate === undefined && body.endDate === undefined) {
			toast.error("Change at least one date, or cancel");
			return;
		}

		try {
			const res = await patchDates.mutateAsync(body);
			toast.success(res.data.message ?? "Period dates updated");
			close();
		} catch (e) {
			toast.error(getApiErrorMessage(e));
		}
	};

	const handleForceLock = async () => {
		if (!modal || modal.type !== "forceLock") return;
		try {
			const res = await forceLockMut.mutateAsync({ periodId: modal.period._id });
			toast.success(res.data.message ?? "Period closed and next opened");
			close();
		} catch (e) {
			toast.error(getApiErrorMessage(e));
		}
	};

	const handleGenerateReports = async () => {
		if (!modal || modal.type !== "reports") return;
		try {
			const res = await genReportsMut.mutateAsync({
				periodId: modal.period._id,
				force: reportsForce || undefined,
			});
			toast.success(res.data.message ?? "Report run completed");
			close();
		} catch (e) {
			toast.error(getApiErrorMessage(e));
		}
	};

	return (
		<>
			<Dialog
				open={modal?.type === "periodDates"}
				onOpenChange={(o) => !o && close()}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Adjust period dates</DialogTitle>
						<DialogDescription>
							<span className="text-foreground font-medium">
								{modal?.type === "periodDates" ? modal.period.name : ""}
							</span>
							{" · "}
							Active period only. Dates use the India business calendar
							(Asia/Kolkata); values are sent as UTC instants (noon IST on each
							day). End date must be ≥ period start and ≥ today UTC + locking
							window.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-3 py-2">
						<Alert>
							<AlertTitle>Changing the start date</AlertTitle>
							<AlertDescription>
								The API rejects a new start date if any KPI entries already exist
								for this period. It also updates the period key and display name—use
								sparingly.
							</AlertDescription>
						</Alert>
						<div className="grid gap-2">
							<Label htmlFor="adm-start">Start date</Label>
							<Input
								id="adm-start"
								type="date"
								value={startDate}
								onChange={(e) => setStartDate(e.target.value)}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="adm-end">End date</Label>
							<Input
								id="adm-end"
								type="date"
								value={endDate}
								onChange={(e) => setEndDate(e.target.value)}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button type="button" variant="outline" onClick={close}>
							Cancel
						</Button>
						<Button
							type="button"
							disabled={patchDates.isPending}
							onClick={() => void handleUpdatePeriodDates()}>
							Apply
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog
				open={modal?.type === "forceLock"}
				onOpenChange={(o) => !o && close()}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Force lock &amp; roll</DialogTitle>
						<DialogDescription>
							<span className="text-foreground font-medium">
								{modal?.type === "forceLock" ? modal.period.name : ""}
							</span>
							. Locks this period, generates reports, closes it, and creates the
							next active period. Irreversible for this cycle.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="gap-2 sm:justify-end">
						<Button type="button" variant="outline" onClick={close}>
							Cancel
						</Button>
						<Button
							type="button"
							variant="destructive"
							disabled={forceLockMut.isPending}
							onClick={() => void handleForceLock()}>
							Run
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog
				open={modal?.type === "reports"}
				onOpenChange={(o) => !o && close()}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Generate reports</DialogTitle>
						<DialogDescription>
							<span className="text-foreground font-medium">
								{modal?.type === "reports" ? modal.period.name : ""}
							</span>
							. Rebuild or retry the KPI report snapshot for this locked period.
							Force deletes existing run aggregates for the period first.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-3 py-2">
						<label className="flex items-center gap-2 text-sm">
							<Checkbox
								checked={reportsForce}
								onCheckedChange={(v) => setReportsForce(v === true)}
							/>
							Force rebuild
						</label>
					</div>
					<DialogFooter>
						<Button type="button" variant="outline" onClick={close}>
							Cancel
						</Button>
						<Button
							type="button"
							disabled={genReportsMut.isPending}
							onClick={() => void handleGenerateReports()}>
							Generate
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
