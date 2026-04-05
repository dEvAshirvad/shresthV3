import Link from "next/link";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { EntriesSection } from "./entries-section";

export default function EntriesPage() {
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
							Entries
						</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>

			<h1 className="font-(family-name:--font-public-sans) text-[2rem] font-bold tracking-tight text-foreground leading-[1.15]">
				KPI entries
			</h1>
			<p className="text-muted-foreground mt-2 max-w-2xl text-[0.9375rem] leading-relaxed">
				Draft and submit scores per employee, template, and period. Import CSV
				downloads a blank template and uploads completed files; Export downloads
				filled sheets. View on a row shows line items in the panel below. Select
				draft rows for bulk submit (up to 500 per request). Only active periods
				accept drafts and submit.
			</p>

			<div className="mt-8">
				<EntriesSection />
			</div>
		</div>
	);
}
