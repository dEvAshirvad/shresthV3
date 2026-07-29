"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

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
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorMessage } from "@/lib/api-error";
import { useListAllEmployees } from "@/queries/employee";
import { useUpsertKpiEntryDraft } from "@/queries/entries";
import { useListKpiPeriods } from "@/queries/periods";
import { useListTemplates } from "@/queries/templates";

type EntryDraftDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function EntryDraftDialog({ open, onOpenChange }: EntryDraftDialogProps) {
	const upsertDraft = useUpsertKpiEntryDraft();

	const { data: tplRes, isPending: tplLoading } = useListTemplates({
		page: 1,
		limit: 200,
	});
	const templates = tplRes?.data?.docs ?? [];

	const { data: employees = [], isPending: empLoading } = useListAllEmployees();

	const { data: perRes, isPending: perLoading } = useListKpiPeriods({
		page: 1,
		limit: 100,
		status: "active",
	});
	const activePeriods = perRes?.data?.docs ?? [];

	const [templateId, setTemplateId] = useState("");
	const [employeeId, setEmployeeId] = useState("");
	const [periodId, setPeriodId] = useState("");
	const [templateItemId, setTemplateItemId] = useState("");
	const [score, setScore] = useState("");
	const [boolValue, setBoolValue] = useState(false);
	const [remarks, setRemarks] = useState("");

	const selectedTemplate = useMemo(
		() => templates.find((t) => t._id === templateId),
		[templates, templateId],
	);

	const selectedItem = useMemo(
		() => selectedTemplate?.items?.find((i) => i._id === templateItemId),
		[selectedTemplate, templateItemId],
	);

	const isBooleanLine = selectedItem?.inputType === "boolean";

	useEffect(() => {
		if (!open) {
			setTemplateId("");
			setEmployeeId("");
			setPeriodId("");
			setTemplateItemId("");
			setScore("");
			setBoolValue(false);
			setRemarks("");
		}
	}, [open]);

	useEffect(() => {
		setTemplateItemId("");
	}, [templateId]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!employeeId || !templateId || !templateItemId) {
			toast.error("Choose employee, template, and line item");
			return;
		}
		if (!isBooleanLine) {
			if (score.trim() === "") {
				toast.error("Enter a numeric value for this line");
				return;
			}
			const num = Number(score);
			if (!Number.isFinite(num)) {
				toast.error("Value must be a number");
				return;
			}
		}
		try {
			await upsertDraft.mutateAsync({
				employeeId,
				templateId,
				...(periodId.trim() ? { periodId: periodId.trim() } : {}),
				items: [
					{
						templateItemId,
						...(isBooleanLine
							? { inputValueBoolean: boolValue }
							: { inputValueNumber: Number(score) }),
						remarks: remarks.trim() || undefined,
					},
				],
			});
			toast.success("Draft saved");
			onOpenChange(false);
		} catch (err) {
			toast.error(getApiErrorMessage(err));
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
				<form onSubmit={(e) => void handleSubmit(e)}>
					<DialogHeader>
						<DialogTitle>Save draft entry</DialogTitle>
						<DialogDescription>
							Upserts one line on the employee&apos;s entry for this template and
							period. Omit period to use the active period. Percent and number
							lines use a numeric value; boolean lines use the checkbox.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-3 py-4">
						<div className="grid gap-2">
							<Label>Template</Label>
							{tplLoading ? (
								<Skeleton className="h-10 w-full" />
							) : (
								<Select value={templateId} onValueChange={setTemplateId} required>
									<SelectTrigger>
										<SelectValue placeholder="Select template" />
									</SelectTrigger>
									<SelectContent>
										{templates.map((t) => (
											<SelectItem key={t._id} value={t._id}>
												{t.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}
						</div>
						<div className="grid gap-2">
							<Label>Employee</Label>
							{empLoading ? (
								<Skeleton className="h-10 w-full" />
							) : (
								<Select value={employeeId} onValueChange={setEmployeeId} required>
									<SelectTrigger>
										<SelectValue placeholder="Select employee" />
									</SelectTrigger>
									<SelectContent>
										{employees.map((em) => (
											<SelectItem key={em._id} value={em._id}>
												{em.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}
						</div>
						<div className="grid gap-2">
							<Label>Period (optional)</Label>
							{perLoading ? (
								<Skeleton className="h-10 w-full" />
							) : (
								<Select
									value={periodId || "__active_default__"}
									onValueChange={(v) =>
										setPeriodId(v === "__active_default__" ? "" : v)
									}>
									<SelectTrigger>
										<SelectValue placeholder="Active period (default)" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="__active_default__">
											Active period (default)
										</SelectItem>
										{activePeriods.map((p) => (
											<SelectItem key={p._id} value={p._id}>
												{p.name} ({p.key})
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}
						</div>
						<div className="grid gap-2">
							<Label>Line item</Label>
							<Select
								value={templateItemId}
								onValueChange={setTemplateItemId}
								disabled={!selectedTemplate?.items?.length}
								required>
								<SelectTrigger>
									<SelectValue
										placeholder={
											selectedTemplate
												? "Select KPI line"
												: "Select a template first"
										}
									/>
								</SelectTrigger>
								<SelectContent>
									{(selectedTemplate?.items ?? [])
										.filter((it): it is typeof it & { _id: string } => Boolean(it._id))
										.map((it) => (
											<SelectItem key={it._id} value={it._id}>
												{it.title}
												<span className="text-muted-foreground ml-1 text-xs">
													({it.inputType})
												</span>
											</SelectItem>
										))}
								</SelectContent>
							</Select>
						</div>
						{isBooleanLine ? (
							<label className="flex items-center gap-2 text-sm">
								<Checkbox
									checked={boolValue}
									onCheckedChange={(v) => setBoolValue(v === true)}
								/>
								Value (true = full max marks for this line)
							</label>
						) : (
							<div className="grid gap-2">
								<Label htmlFor="draft-score">Value (number)</Label>
								<Input
									id="draft-score"
									type="number"
									step="any"
									value={score}
									onChange={(e) => setScore(e.target.value)}
									placeholder="e.g. 85 for percent or target"
								/>
							</div>
						)}
						<div className="grid gap-2">
							<Label htmlFor="draft-rem">Remarks (optional)</Label>
							<Textarea
								id="draft-rem"
								value={remarks}
								onChange={(e) => setRemarks(e.target.value)}
								rows={2}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
							Cancel
						</Button>
						<Button type="submit" disabled={upsertDraft.isPending}>
							{upsertDraft.isPending ? "Saving…" : "Save draft"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
