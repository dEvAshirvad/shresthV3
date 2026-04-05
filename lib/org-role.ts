/** How much of the dashboard route group the user may use. */
export type OrgDashboardAccess = "full" | "nodal" | "staff";

/**
 * Maps session/API member role to dashboard access.
 * Owner and admin: all dashboard pages. Nodal: subset. Everyone else: staff (no dashboard).
 */
export function getOrgDashboardAccess(
	role: string | null | undefined,
): OrgDashboardAccess {
	const r = (role ?? "").toLowerCase().trim();
	if (r === "owner" || r === "admin") return "full";
	if (r === "nodal") return "nodal";
	return "staff";
}

/** Path prefixes nodal users may access (includes nested routes, e.g. `/templates/new`). */
export const NODAL_ALLOWED_PATH_PREFIXES = [
	"/nodal",
	"/templates",
	"/employee",
	"/entries",
] as const;

export function isPathAllowedForNodal(pathname: string): boolean {
	const p = (pathname.split("?")[0] ?? "").replace(/\/$/, "") || "/";
	return NODAL_ALLOWED_PATH_PREFIXES.some(
		(prefix) => p === prefix || p.startsWith(`${prefix}/`),
	);
}

export function isPathAllowedForDashboardAccess(
	access: OrgDashboardAccess,
	pathname: string,
): boolean {
	if (access === "full") return true;
	if (access === "nodal") return isPathAllowedForNodal(pathname);
	return false;
}
