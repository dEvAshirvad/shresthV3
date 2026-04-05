import Link from "next/link";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { TemplatesSection } from "./templates-section";

export default function TemplatesPage() {
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
							Templates
						</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>

			<h1 className="font-(family-name:--font-public-sans) text-[2rem] font-bold tracking-tight text-foreground leading-[1.15]">
				KPI templates
			</h1>
			<p className="text-muted-foreground mt-2 max-w-2xl text-[0.9375rem] leading-relaxed">
				Reusable scoring definitions per department and role. Each line item pairs
				an input type with a judgement rule (percent, target slabs, boolean, or
				range bands). At least one employee in that department must use the same role
				string before the template can be saved. Use{" "}
				<Link href="/templates/new" className="text-foreground underline underline-offset-2">
					New template
				</Link>{" "}
				to define all line items; quick edits to name, role, and department stay
				in the row action dialog.
			</p>

			<div className="mt-8">
				<TemplatesSection />
			</div>
		</div>
	);
}
