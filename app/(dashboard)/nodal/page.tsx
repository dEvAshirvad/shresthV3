import Link from "next/link";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { NodalSection } from "./nodal-section";

export default function NodalPage() {
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
						<BreadcrumbPage className="text-foreground">Nodal</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>

			<h1 className="font-(family-name:--font-public-sans) text-[2rem] font-bold tracking-tight text-foreground leading-[1.15]">
				Nodal operations
			</h1>
			<p className="text-muted-foreground mt-2 max-w-2xl text-[0.9375rem] leading-relaxed">
				Manage <strong>nodal candidates</strong> (
				<code className="text-xs">/api/v1/nodal</code>), import by phone, sync
				members, bulk-send <strong>nodal</strong>-role invitations, and track
				pending nodal invites. Organization <strong>admin</strong> bulk invite (
				<code className="text-xs">/api/v1/organization/invitations</code>) lives on
				the{" "}
				<Link href="/admin" className="text-primary underline underline-offset-2">
					Admin
				</Link>{" "}
				page.
			</p>

			<div className="mt-8">
				<NodalSection />
			</div>
		</div>
	);
}
