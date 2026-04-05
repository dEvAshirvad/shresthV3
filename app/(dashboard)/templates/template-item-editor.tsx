"use client";

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import {
	createEmptyDraftItem,
	type DraftJudgementKind,
	type DraftTemplateItem,
} from "./template-draft-utils";

const KIND_LABELS: Record<DraftJudgementKind, string> = {
	percent: "Percent (0–100 → scaled to max marks)",
	target: "Target slabs (number input)",
	boolean: "Boolean (true / false)",
	range: "Numeric range bands (first match wins)",
};

function showUnitField(kind: DraftJudgementKind): boolean {
	return kind === "target" || kind === "range";
}

type TemplateItemEditorProps = {
	item: DraftTemplateItem;
	index: number;
	onChange: (next: DraftTemplateItem) => void;
	onRemove: () => void;
	canRemove: boolean;
};

export function TemplateItemEditor({
	item,
	index,
	onChange,
	onRemove,
	canRemove,
}: TemplateItemEditorProps) {
	const handleKindChange = (kind: DraftJudgementKind) => {
		if (kind === item.kind) return;
		const base = createEmptyDraftItem(kind);
		onChange({
			...base,
			localId: item.localId,
			existingId: item.existingId,
			title: item.title,
			description: item.description,
			unit: kind === "percent" || kind === "boolean" ? "" : item.unit,
			maxMarks: item.maxMarks,
			isActive: item.isActive,
		});
	};

	const updateSlab = (
		slabIndex: number,
		field: "target" | "marks",
		value: string,
	) => {
		const slabs = item.slabs.map((s, i) =>
			i === slabIndex ? { ...s, [field]: value } : s,
		);
		onChange({ ...item, slabs });
	};

	const addSlab = () => {
		onChange({
			...item,
			slabs: [...item.slabs, { target: "0", marks: "0" }],
		});
	};

	const removeSlab = (slabIndex: number) => {
		if (item.slabs.length <= 1) return;
		onChange({
			...item,
			slabs: item.slabs.filter((_, i) => i !== slabIndex),
		});
	};

	const updateRangeBand = (
		bandIndex: number,
		field: "min" | "max" | "marks",
		value: string,
	) => {
		const rangeBands = item.rangeBands.map((b, i) =>
			i === bandIndex ? { ...b, [field]: value } : b,
		);
		onChange({ ...item, rangeBands });
	};

	const addRangeBand = () => {
		onChange({
			...item,
			rangeBands: [...item.rangeBands, { min: "0", max: "0", marks: "0" }],
		});
	};

	const removeRangeBand = (bandIndex: number) => {
		if (item.rangeBands.length <= 1) return;
		onChange({
			...item,
			rangeBands: item.rangeBands.filter((_, i) => i !== bandIndex),
		});
	};

	return (
		<Card className="rounded-none border border-border/40 bg-card">
			<CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-3">
				<CardTitle className="text-base font-semibold">
					Line item {index + 1}
				</CardTitle>
				{canRemove ? (
					<Button
						type="button"
						variant="ghost"
						size="icon"
						className="text-muted-foreground size-8 shrink-0"
						onClick={onRemove}
						aria-label="Remove line item">
						<Trash2 className="size-4" />
					</Button>
				) : null}
			</CardHeader>
			<CardContent className="grid gap-4">
				<div className="grid gap-2">
					<Label htmlFor={`ti-kind-${item.localId}`}>Scoring rule</Label>
					<Select
						value={item.kind}
						onValueChange={(v) => handleKindChange(v as DraftJudgementKind)}>
						<SelectTrigger id={`ti-kind-${item.localId}`}>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{(Object.keys(KIND_LABELS) as DraftJudgementKind[]).map((k) => (
								<SelectItem key={k} value={k}>
									{KIND_LABELS[k]}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<p className="text-muted-foreground text-xs leading-relaxed">
						Pairs <code className="rounded bg-muted px-1">inputType</code> with
						judgement (percent, target slabs, boolean, or range bands). Unit is
						only for number lines (target/range). Do not send{" "}
						<code className="rounded bg-muted px-1">unit</code> for percent
						items.
					</p>
				</div>

				<div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
					<div className="grid gap-2">
						<Label htmlFor={`ti-title-${item.localId}`}>Title</Label>
						<Input
							id={`ti-title-${item.localId}`}
							value={item.title}
							onChange={(e) => onChange({ ...item, title: e.target.value })}
							placeholder="e.g. Revenue attainment"
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor={`ti-max-${item.localId}`}>Max marks</Label>
						<Input
							id={`ti-max-${item.localId}`}
							type="number"
							min={0}
							step="any"
							value={item.maxMarks}
							onChange={(e) => onChange({ ...item, maxMarks: e.target.value })}
						/>
					</div>
				</div>

				<div className="grid gap-2">
					<Label htmlFor={`ti-desc-${item.localId}`}>
						Description (optional)
					</Label>
					<Textarea
						id={`ti-desc-${item.localId}`}
						value={item.description}
						onChange={(e) => onChange({ ...item, description: e.target.value })}
						rows={2}
					/>
				</div>

				{item.kind === "percent" ? (
					<p className="text-muted-foreground text-xs leading-relaxed">
						Percent inputs are always 0–100; the API does not use a unit field
						for this line item.
					</p>
				) : null}

				{showUnitField(item.kind) ? (
					<div className="grid gap-2 sm:max-w-xs">
						<Label htmlFor={`ti-unit-${item.localId}`}>Unit (optional)</Label>
						<Input
							id={`ti-unit-${item.localId}`}
							value={item.unit}
							onChange={(e) => onChange({ ...item, unit: e.target.value })}
							placeholder="e.g. visits, ₹"
						/>
					</div>
				) : null}

				{item.kind === "target" ? (
					<div className="border-border space-y-3 border-t pt-4">
						<div className="grid max-w-xs gap-2">
							<Label>Slab selection mode</Label>
							<Select
								value={item.targetMode}
								onValueChange={(v) =>
									onChange({
										...item,
										targetMode: v as "best_match" | "nearest",
									})
								}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="best_match">
										Best match (≥ target)
									</SelectItem>
									<SelectItem value="nearest">Nearest target</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label>Slabs (target → marks)</Label>
							{item.slabs.map((row, si) => (
								<div
									key={`${item.localId}-slab-${si}`}
									className="flex flex-wrap items-end gap-2">
									<div className="grid min-w-0 flex-1 gap-1 sm:max-w-[140px]">
										<span className="text-muted-foreground text-xs">
											Target
										</span>
										<Input
											type="number"
											min={0}
											step="any"
											value={row.target}
											onChange={(e) => updateSlab(si, "target", e.target.value)}
										/>
									</div>
									<div className="grid min-w-0 flex-1 gap-1 sm:max-w-[140px]">
										<span className="text-muted-foreground text-xs">Marks</span>
										<Input
											type="number"
											min={0}
											step="any"
											value={row.marks}
											onChange={(e) => updateSlab(si, "marks", e.target.value)}
										/>
									</div>
									<Button
										type="button"
										variant="outline"
										size="sm"
										disabled={item.slabs.length <= 1}
										onClick={() => removeSlab(si)}>
										Remove
									</Button>
								</div>
							))}
							<Button
								type="button"
								variant="secondary"
								size="sm"
								onClick={addSlab}>
								Add slab
							</Button>
						</div>
					</div>
				) : null}

				{item.kind === "boolean" ? (
					<div className="border-border text-muted-foreground space-y-1 border-t pt-4 text-sm leading-relaxed">
						<p>
							<code className="rounded bg-muted px-1 text-xs">true</code> awards
							the full max marks for this line;{" "}
							<code className="rounded bg-muted px-1 text-xs">false</code>{" "}
							awards <code className="rounded bg-muted px-1 text-xs">0</code>.
							The API does not use a separate “true marks” field.
						</p>
					</div>
				) : null}

				{item.kind === "range" ? (
					<div className="border-border space-y-3 border-t pt-4">
						<p className="text-muted-foreground text-xs leading-relaxed">
							Bands are evaluated in list order; the first band where the
							achieved value falls between min and max (inclusive) wins.
						</p>
						<div className="space-y-2">
							<Label>Range bands (min → max → marks)</Label>
							{item.rangeBands.map((row, bi) => (
								<div
									key={`${item.localId}-rb-${bi}`}
									className="flex flex-wrap items-end gap-2">
									<div className="grid min-w-0 flex-1 gap-1 sm:max-w-[120px]">
										<span className="text-muted-foreground text-xs">Min</span>
										<Input
											type="number"
											step="any"
											value={row.min}
											onChange={(e) =>
												updateRangeBand(bi, "min", e.target.value)
											}
										/>
									</div>
									<div className="grid min-w-0 flex-1 gap-1 sm:max-w-[120px]">
										<span className="text-muted-foreground text-xs">Max</span>
										<Input
											type="number"
											step="any"
											value={row.max}
											onChange={(e) =>
												updateRangeBand(bi, "max", e.target.value)
											}
										/>
									</div>
									<div className="grid min-w-0 flex-1 gap-1 sm:max-w-[120px]">
										<span className="text-muted-foreground text-xs">Marks</span>
										<Input
											type="number"
											min={0}
											step="any"
											value={row.marks}
											onChange={(e) =>
												updateRangeBand(bi, "marks", e.target.value)
											}
										/>
									</div>
									<Button
										type="button"
										variant="outline"
										size="sm"
										disabled={item.rangeBands.length <= 1}
										onClick={() => removeRangeBand(bi)}>
										Remove
									</Button>
								</div>
							))}
							<Button
								type="button"
								variant="secondary"
								size="sm"
								onClick={addRangeBand}>
								Add band
							</Button>
						</div>
					</div>
				) : null}
			</CardContent>
		</Card>
	);
}
