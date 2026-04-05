/**
 * India business calendar: interpret user-facing YYYY-MM-DD as a wall date in
 * {@link BUSINESS_TIMEZONE}. The API remains UTC-only — this module maps between
 * that policy and instants / UTC date strings you choose to store.
 *
 * **Anchors** (pick one product rule and use it consistently):
 * - `start` — start of the IST calendar day (`00:00` in Asia/Kolkata).
 * - `noon` — **default**; stable midpoint, avoids DST issues (IST has no DST).
 * - `end` — end of the IST calendar day (`23:59:59.999` in Asia/Kolkata).
 *
 * Example: `2026-04-01` with `start` → `2026-03-31T18:30:00.000Z` → UTC calendar
 * date `2026-03-31`. Same day with `noon` → usually UTC `2026-04-01`.
 */

export const BUSINESS_TIMEZONE = "Asia/Kolkata";

export type IstDayAnchor = "start" | "noon" | "end";

const YMD = /^\d{4}-\d{2}-\d{2}$/;

/** Whether `s` is a strict `YYYY-MM-DD` string. */
export function isYmd(s: string): boolean {
	return YMD.test(s.trim());
}

/**
 * IST wall-clock time on the given calendar day, returned as a UTC ISO string
 * (for APIs that accept full ISO datetimes).
 */
export function istBusinessYmdToUtcIsoInstant(
	ymd: string,
	anchor: IstDayAnchor = "noon",
): string {
	const d = ymd.trim();
	if (!YMD.test(d)) {
		throw new Error(`istBusinessYmdToUtcIsoInstant: expected YYYY-MM-DD, got "${ymd}"`);
	}
	const time =
		anchor === "start"
			? "T00:00:00.000"
			: anchor === "end"
				? "T23:59:59.999"
				: "T12:00:00.000";
	return new Date(`${d}${time}+05:30`).toISOString();
}

/**
 * UTC **calendar** `YYYY-MM-DD` (first 10 chars of the instant’s ISO time in UTC)
 * for an IST business day — use when the backend stores a date-only string
 * derived from the UTC day of an anchored instant.
 */
export function utcCalendarYmdFromIstBusinessDay(
	ymd: string,
	anchor: IstDayAnchor = "noon",
): string {
	return istBusinessYmdToUtcIsoInstant(ymd, anchor).slice(0, 10);
}

/**
 * Calendar date in {@link BUSINESS_TIMEZONE} for an API instant (UTC ISO string).
 * Use to seed `<input type="date" />` when the value means “India business day”.
 */
export function utcInstantToIstCalendarYmd(iso: string): string {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) {
		return iso.trim().slice(0, 10);
	}
	const parts = new Intl.DateTimeFormat("en-CA", {
		timeZone: BUSINESS_TIMEZONE,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).formatToParts(d);
	const y = parts.find((p) => p.type === "year")?.value;
	const m = parts.find((p) => p.type === "month")?.value;
	const day = parts.find((p) => p.type === "day")?.value;
	if (!y || !m || !day) return iso.trim().slice(0, 10);
	return `${y}-${m}-${day}`;
}

/**
 * Normalize API values for a date field: full ISO → IST calendar `YYYY-MM-DD`;
 * bare `YYYY-MM-DD` → unchanged.
 */
export function apiDateFieldToIstYmdForInput(isoOrYmd: string | null | undefined): string {
	if (!isoOrYmd) return "";
	const s = isoOrYmd.trim();
	if (s.includes("T")) return utcInstantToIstCalendarYmd(s);
	return s.slice(0, 10);
}

/** `true` if `ymd` parses as noon IST on that wall date. */
export function isValidIstBusinessYmd(ymd: string): boolean {
	const t = ymd.trim();
	if (!YMD.test(t)) return false;
	const ms = Date.parse(`${t}T12:00:00+05:30`);
	return !Number.isNaN(ms);
}

/**
 * Human-readable date in India timezone (for tables and labels).
 */
export function formatIsoInstantInIst(
	iso: string,
	style: "short" | "medium" | "long" = "medium",
): string {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return iso;
	return new Intl.DateTimeFormat(undefined, {
		timeZone: BUSINESS_TIMEZONE,
		dateStyle: style,
	}).format(d);
}

/** First day of the current month in {@link BUSINESS_TIMEZONE} (`YYYY-MM-DD`). */
export function istCurrentMonthFirstDayYmd(now: Date = new Date()): string {
	const ymd = utcInstantToIstCalendarYmd(now.toISOString());
	const [y, m] = ymd.split("-");
	if (!y || !m) return ymd;
	return `${y}-${m}-01`;
}
