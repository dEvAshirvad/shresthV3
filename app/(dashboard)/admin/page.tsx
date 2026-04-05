import Link from "next/link";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { AdminSection } from "./admin-section";

export default function AdminPage() {
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
						<BreadcrumbPage className="text-foreground">Admin</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>

			<h1 className="font-(family-name:--font-public-sans) text-[2rem] font-bold tracking-tight text-foreground leading-[1.15]">
				Organization admin
			</h1>
			<p className="text-muted-foreground mt-2 max-w-2xl text-[0.9375rem] leading-relaxed">
				List and bulk-import <strong>admin</strong> invitations (
				<code className="text-xs">/api/v1/organization/invitations</code>), manage
				members, and bulk-import departments. Nodal candidates and nodal invites
				live on the{" "}
				<Link href="/nodal" className="text-primary underline underline-offset-2">
					Nodal
				</Link>{" "}
				page.
			</p>

			<div className="mt-8">
				<AdminSection />
			</div>
		</div>
	);
}
