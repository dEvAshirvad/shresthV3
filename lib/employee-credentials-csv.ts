import type { EmployeeCredential } from "@/queries/employee";

function csvEscape(value: string): string {
	if (/[",\n\r]/.test(value)) {
		return `"${value.replace(/"/g, '""')}"`;
	}
	return value;
}

/** One-time download of generated employee passwords (never re-fetchable from API). */
export function downloadEmployeeCredentialsCsv(
	credentials: EmployeeCredential[],
	filename = "employee-credentials.csv",
) {
	const header = ["name", "phone", "email", "empId", "password"];
	const lines = [
		header.join(","),
		...credentials.map((c) =>
			[
				csvEscape(c.name),
				csvEscape(c.phone),
				csvEscape(c.email || ""),
				csvEscape(c.empId),
				csvEscape(c.password),
			].join(","),
		),
	];
	const blob = new Blob([`${lines.join("\n")}\n`], {
		type: "text/csv;charset=utf-8",
	});
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.rel = "noopener";
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}
