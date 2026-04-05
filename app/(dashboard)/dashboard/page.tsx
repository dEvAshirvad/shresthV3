import Link from "next/link";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	BuildingIcon,
	CalendarRangeIcon,
	FileIcon,
	FileSpreadsheetIcon,
	LayoutDashboardIcon,
	ShieldIcon,
	UserIcon,
	UsersRound,
} from "lucide-react";

const MODULES = [
	{
		href: "/department",
		title: "Departments",
		description:
			"Create departments and assign a nodal owner for KPI operations.",
		icon: BuildingIcon,
	},
	{
		href: "/periods",
		title: "KPI periods",
		description: "Create and manage KPI periods.",
		icon: CalendarRangeIcon,
	},
	{
		href: "/admin",
		title: "Organization admin",
		description: "Invite admins, bulk-import admin CSV, members, departments.",
		icon: ShieldIcon,
	},
	{
		href: "/nodal",
		title: "Nodal",
		description: "Nodal candidates, import, sync members, send nodal invitations.",
		icon: UsersRound,
	},
	{
		href: "/employee",
		title: "Employees",
		description: "Add people, roles, and send invitations per department.",
		icon: UserIcon,
	},
	{
		href: "/templates",
		title: "KPI templates",
		description: "Define scoring rules per department and role.",
		icon: FileIcon,
	},
	{
		href: "/entries",
		title: "Entries",
		description: "Draft, submit, or bulk-import KPI scores for each period.",
		icon: FileSpreadsheetIcon,
	},
	{
		href: "/reports",
		title: "Reports",
		description:
			"View runs and rankings after the period is closed (summary and stats need closed period).",
		icon: LayoutDashboardIcon,
	},
] as const;

function DashboardPage() {
	return (
		<div>
			<Breadcrumb className="mb-4 uppercase text-xs font-semibold text-primary">
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink asChild>
							<Link href="/dashboard">System</Link>
						</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbPage>Dashboard</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>

			<h1 className="text-4xl font-black text-primary">Dashboard</h1>
			<p className="text-primary/80 mt-2 max-w-2xl text-sm">
				Use the checklist below to run your KPI programme: structure your org,
				then capture entries during an active period. Reports unlock after the
				period closes.
			</p>

			<section className="mt-10" aria-labelledby="setup-heading">
				<h2 id="setup-heading" className="sr-only">
					Recommended setup order
				</h2>
				<ol className="text-muted-foreground list-decimal space-y-2 pl-5 text-sm">
					<li>Configure departments and assign nodals.</li>
					<li>Add employees (and roles) per department.</li>
					<li>Create KPI templates aligned to those roles.</li>
					<li>Enter or import scores before the period locks.</li>
					<li>Open reports once the period is closed.</li>
				</ol>
			</section>

			<div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
				{MODULES.map(({ href, title, description, icon: Icon }) => (
					<Link key={href} href={href} className="group block rounded-lg">
						<Card className="h-full transition-shadow group-hover:shadow-md">
							<CardHeader>
								<div className="flex items-start gap-3">
									<Icon className="text-primary mt-0.5 size-5 shrink-0" />
									<div>
										<CardTitle className="text-base">{title}</CardTitle>
										<CardDescription className="mt-1.5">
											{description}
										</CardDescription>
									</div>
								</div>
							</CardHeader>
						</Card>
					</Link>
				))}
			</div>
		</div>
	);
}

export default DashboardPage;
