import Link from "next/link";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { ReportsSection } from "./reports-section";

export default function ReportsPage() {
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
							Reports
						</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>

			<h1 className="font-(family-name:--font-public-sans) text-[2rem] font-bold tracking-tight text-foreground leading-[1.15]">
				Reports
			</h1>
			<p className="text-muted-foreground mt-2 max-w-2xl text-[0.9375rem] leading-relaxed">
				Browse generated report runs, then open a period to see the full insights
				dashboard on its own page. Detail is available after the period is closed;
				until then APIs may return{" "}
				<code className="rounded bg-muted px-1 text-xs">REPORT_NOT_READY</code>.
			</p>

			<div className="mt-8">
				<ReportsSection />
			</div>
		</div>
	);
}
