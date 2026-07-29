import type { KpiEntryItem } from "@/queries/entries";
import { formatDecimal2 } from "@/lib/number-format";

import type { EntryLineItemRow } from "./entry-line-items-columns";

function judgementTypeLabel(item: KpiEntryItem): string {
	const j = item.judgement;
	if (j && typeof j === "object" && "type" in j && typeof j.type === "string") {
		return j.type;
	}
	return "—";
}

function valueLabel(item: KpiEntryItem): string {
	const t = String(item.inputType ?? "").toLowerCase();
	if (t === "boolean" || item.inputValueBoolean !== undefined) {
		if (item.inputValueBoolean === undefined) return "—";
		return item.inputValueBoolean ? "true" : "false";
	}
	if (
		item.inputValueNumber !== undefined &&
		item.inputValueNumber !== null &&
		Number.isFinite(Number(item.inputValueNumber))
	) {
		return formatDecimal2(Number(item.inputValueNumber));
	}
	return "—";
}

export function mapEntryItemsToRows(items: KpiEntryItem[]): EntryLineItemRow[] {
	return items.map((item) => ({
		id: String(item.templateItemId ?? ""),
		title: String(item.title ?? item.templateItemId ?? ""),
		inputType: String(item.inputType ?? "—"),
		judgementType: judgementTypeLabel(item),
		maxMarks: Number(item.maxMarks ?? 0),
		valueLabel: valueLabel(item),
		awardedMarks: Number(item.awardedMarks ?? 0),
		remarks: item.remarks ? String(item.remarks) : "",
	}));
}
