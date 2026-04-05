import Link from "next/link";

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { TemplateEditForm } from "../../template-edit-form";

type PageProps = {
	params: Promise<{ id: string }>;
};

export default async function EditTemplatePage({ params }: PageProps) {
	const { id } = await params;

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
						<BreadcrumbLink asChild>
							<Link href="/templates">Templates</Link>
						</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator className="opacity-50 [&>svg]:size-3" />
					<BreadcrumbItem>
						<BreadcrumbPage className="text-foreground">Edit</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>

			<h1 className="font-(family-name:--font-public-sans) text-[2rem] font-bold tracking-tight text-foreground leading-[1.15]">
				Edit KPI template
			</h1>
			<p className="text-muted-foreground mt-2 max-w-2xl text-[0.9375rem] leading-relaxed">
				Update template details and KPI line items (titles, scoring rules, max
				marks, and active flags). Changes replace the template&apos;s items on save.
			</p>

			<div className="mt-8">
				<TemplateEditForm templateId={id} />
			</div>
		</div>
	);
}
