import type { KpiItemJudgement, KpiTemplateItem } from "@/queries/templates";

/** Drives `inputType` + `judgement` pairing per API. */
export type DraftJudgementKind = "percent" | "target" | "boolean" | "range";

export type DraftSlabRow = { target: string; marks: string };

export type DraftRangeBand = { min: string; max: string; marks: string };

export type DraftTemplateItem = {
	localId: string;
	/** Preserves `KpiTemplateItem._id` when editing an existing line item. */
	existingId?: string;
	title: string;
	description: string;
	unit: string;
	maxMarks: string;
	isActive: boolean;
	kind: DraftJudgementKind;
	targetMode: "best_match" | "nearest";
	slabs: DraftSlabRow[];
	rangeBands: DraftRangeBand[];
};

function newLocalId(): string {
	if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
		return crypto.randomUUID();
	}
	return `item-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createEmptyDraftItem(
	kind: DraftJudgementKind = "percent",
): DraftTemplateItem {
	return {
		localId: newLocalId(),
		title: "",
		description: "",
		unit: "",
		maxMarks: "50",
		isActive: true,
		kind,
		targetMode: "best_match",
		slabs: [
			{ target: "20", marks: "30" },
			{ target: "10", marks: "15" },
			{ target: "5", marks: "5" },
		],
		rangeBands: [
			{ min: "90", max: "100", marks: "20" },
			{ min: "80", max: "89.99", marks: "15" },
			{ min: "0", max: "79.99", marks: "5" },
		],
	};
}

function parseNonNeg(s: string): number | null {
	const t = s.trim();
	if (!t) return null;
	const n = Number(t);
	if (!Number.isFinite(n) || n < 0) {
		return null;
	}
	return n;
}

function parsePositive(s: string): number | null {
	const t = s.trim();
	if (!t) return null;
	const n = Number(t);
	if (!Number.isFinite(n) || n <= 0) {
		return null;
	}
	return n;
}

function buildJudgement(
	d: DraftTemplateItem,
):
	| { ok: true; judgement: KpiItemJudgement }
	| { ok: false; message: string } {
	switch (d.kind) {
		case "percent":
			return { ok: true, judgement: { type: "percent", mode: "linear" } };
		case "boolean":
			return { ok: true, judgement: { type: "boolean" } };
		case "range": {
			if (d.rangeBands.length < 1) {
				return { ok: false, message: "Add at least one range band" };
			}
			const ranges: Array<{ min: number; max: number; marks: number }> = [];
			for (let i = 0; i < d.rangeBands.length; i++) {
				const row = d.rangeBands[i];
				const min = parseNonNeg(row.min);
				const max = parseNonNeg(row.max);
				const marks = parseNonNeg(row.marks);
				if (min === null || max === null || marks === null) {
					return {
						ok: false,
						message: `Band ${i + 1}: min, max, and marks must be valid numbers ≥ 0`,
					};
				}
				if (min > max) {
					return {
						ok: false,
						message: `Band ${i + 1}: min must be ≤ max`,
					};
				}
				ranges.push({ min, max, marks });
			}
			return { ok: true, judgement: { type: "range", ranges } };
		}
		case "target": {
			if (d.slabs.length < 1) {
				return { ok: false, message: "Add at least one target slab" };
			}
			const slabs: Array<{ target: number; marks: number }> = [];
			for (let i = 0; i < d.slabs.length; i++) {
				const row = d.slabs[i];
				const target = parseNonNeg(row.target);
				const marks = parseNonNeg(row.marks);
				if (target === null || marks === null) {
					return {
						ok: false,
						message: `Slab ${i + 1}: target and marks must be numbers ≥ 0`,
					};
				}
				slabs.push({ target, marks });
			}
			return {
				ok: true,
				judgement: {
					type: "target",
					mode: d.targetMode,
					slabs,
				},
			};
		}
		default: {
			const _exhaustive: never = d.kind;
			return _exhaustive;
		}
	}
}

/** Maps draft kind → API `inputType`. */
export function draftKindToInputType(
	kind: DraftJudgementKind,
): "number" | "percent" | "boolean" {
	if (kind === "percent") return "percent";
	if (kind === "boolean") return "boolean";
	return "number";
}

export function draftsToKpiTemplateItems(
	drafts: DraftTemplateItem[],
): { ok: true; items: KpiTemplateItem[] } | { ok: false; message: string } {
	if (drafts.length < 1) {
		return { ok: false, message: "Add at least one KPI line item" };
	}
	const items: KpiTemplateItem[] = [];
	for (let i = 0; i < drafts.length; i++) {
		const d = drafts[i];
		const title = d.title.trim();
		if (!title) {
			return { ok: false, message: `Item ${i + 1}: title is required` };
		}
		const maxMarks = parsePositive(d.maxMarks);
		if (maxMarks === null) {
			return {
				ok: false,
				message: `Item ${i + 1}: max marks must be a number greater than 0`,
			};
		}
		const built = buildJudgement(d);
		if (!built.ok) {
			return { ok: false, message: `Item ${i + 1}: ${built.message}` };
		}
		const { judgement } = built;
		const inputType = draftKindToInputType(d.kind);

		const item: KpiTemplateItem = {
			title,
			inputType,
			maxMarks,
			judgement,
			isActive: d.isActive,
		};
		const desc = d.description.trim();
		if (desc) item.description = desc;
		// Unit only for number KPIs (target / range). Omit for percent & boolean.
		if (inputType === "number") {
			const u = d.unit.trim();
			if (u) item.unit = u;
		}

		if (d.existingId) {
			item._id = d.existingId;
		}

		items.push(item);
	}
	return { ok: true, items };
}

/** Maps API template items into editable drafts (for edit page). */
export function kpiTemplateItemToDraft(item: KpiTemplateItem): DraftTemplateItem {
	const defaults = createEmptyDraftItem("percent");
	const j = item.judgement;
	let kind: DraftJudgementKind = "percent";
	let slabs = defaults.slabs;
	let rangeBands = defaults.rangeBands;
	let targetMode: "best_match" | "nearest" = "best_match";

	if (j.type === "percent") {
		kind = "percent";
	} else if (j.type === "boolean") {
		kind = "boolean";
	} else if (j.type === "target") {
		kind = "target";
		targetMode = j.mode ?? "best_match";
		slabs = j.slabs.map((s) => ({
			target: String(s.target),
			marks: String(s.marks),
		}));
	} else if (j.type === "range") {
		kind = "range";
		rangeBands = j.ranges.map((r) => ({
			min: String(r.min),
			max: String(r.max),
			marks: String(r.marks),
		}));
	}

	return {
		localId: newLocalId(),
		existingId: item._id,
		title: item.title,
		description: item.description ?? "",
		unit: item.unit ?? "",
		maxMarks: String(item.maxMarks),
		isActive: item.isActive !== false,
		kind,
		targetMode,
		slabs,
		rangeBands,
	};
}

export function kpiTemplateItemsToDrafts(
	items: KpiTemplateItem[],
): DraftTemplateItem[] {
	if (!items?.length) return [createEmptyDraftItem("percent")];
	return items.map(kpiTemplateItemToDraft);
}
