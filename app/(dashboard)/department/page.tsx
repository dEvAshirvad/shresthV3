import Link from "next/link";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { DepartmentDataTable } from "./department-data-table";

export default function DepartmentPage() {
	return (
		<div>
			<Breadcrumb className="mb-2 uppercase text-[0.6875rem] font-medium leading-tight tracking-[0.08em] text-muted-foreground">
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink asChild>
							<Link href="/dashboard">System</Link>
						</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator className="opacity-50 [&>svg]:size-3" />
					<BreadcrumbItem>
						<BreadcrumbPage className="text-foreground">
							Department
						</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>

			<h1 className="font-(family-name:--font-public-sans) text-[2rem] font-bold tracking-tight text-foreground leading-[1.15]">
				Department Management
			</h1>
			<p className="mt-2 max-w-xl text-[0.9375rem] leading-relaxed text-muted-foreground">
				Departments are scoped to an organisation. Assign a nodal member to own
				submissions and configuration for each department — see{" "}
				<Link href="/admin" className="text-primary underline underline-offset-2">
					Admin
				</Link>{" "}
				(members, admin invites) or{" "}
				<Link href="/nodal" className="text-primary underline underline-offset-2">
					Nodal
				</Link>{" "}
				(candidates, nodal invites). Use Import in the toolbar to download a template and bulk upsert from
				CSV or Excel; optional <span className="font-mono text-xs">nodal_email</span>{" "}
				assigns a nodal when the address matches an org member.
			</p>

			<div className="mt-8">
				<DepartmentDataTable />
			</div>
		</div>
	);
}
