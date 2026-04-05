import type { KpiEntry } from "@/queries/entries";

export type EntryTableRow = KpiEntry & {
	templateLabel: string;
	employeeLabel: string;
	periodLabel: string;
};

export function mapEntryToRow(
	entry: KpiEntry,
	opts: {
		templateNameById: Map<string, string>;
		employeeNameById: Map<string, string>;
		periodNameById: Map<string, string>;
	},
): EntryTableRow {
	return {
		...entry,
		templateLabel:
			entry.template?.name ??
			opts.templateNameById.get(entry.templateId) ??
			entry.templateId,
		employeeLabel:
			entry.employee?.name ??
			opts.employeeNameById.get(entry.employeeId) ??
			entry.employeeId,
		periodLabel: opts.periodNameById.get(entry.periodId) ?? entry.periodId,
	};
}
