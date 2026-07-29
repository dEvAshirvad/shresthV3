const DECIMAL_2_FORMATTER = new Intl.NumberFormat("en-US", {
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
});

export function formatDecimal2(
	value: number | null | undefined,
	fallback = "—",
): string {
	if (value === null || value === undefined || !Number.isFinite(value)) {
		return fallback;
	}
	return DECIMAL_2_FORMATTER.format(value);
}

export function formatPercent2(
	value: number | null | undefined,
	fallback = "—",
): string {
	const formatted = formatDecimal2(value, fallback);
	if (formatted === fallback) return fallback;
	return `${formatted}%`;
}
