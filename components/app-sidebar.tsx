"use client";

import * as React from "react";

import { useAuth } from "@/components/providers/auth-provider";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
} from "@/components/ui/sidebar";
import { getOrgDashboardAccess, type OrgDashboardAccess } from "@/lib/org-role";
import { useGetActiveOrganizationMember } from "@/queries/auth";
import {
	BarChart3Icon,
	BuildingIcon,
	CalendarRangeIcon,
	ClipboardListIcon,
	FileIcon,
	LayoutDashboardIcon,
	ShieldIcon,
	UserIcon,
	UsersRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type NavItem = {
	title: string;
	url: string;
	icon: React.ReactNode;
	/** `full` = owner/admin only; `nodal_plus` = owner, admin, or nodal */
	visibility: "full" | "nodal_plus";
};

const NAV_MAIN: NavItem[] = [
	{
		title: "Dashboard",
		url: "/dashboard",
		icon: <LayoutDashboardIcon className="size-4 shrink-0" />,
		visibility: "full",
	},
	{
		title: "Department",
		url: "/department",
		icon: <BuildingIcon className="size-4 shrink-0" />,
		visibility: "full",
	},
	{
		title: "KPI periods",
		url: "/periods",
		icon: <CalendarRangeIcon className="size-4 shrink-0" />,
		visibility: "full",
	},
	{
		title: "Admin",
		url: "/admin",
		icon: <ShieldIcon className="size-4 shrink-0" />,
		visibility: "full",
	},
	{
		title: "Nodal",
		url: "/nodal",
		icon: <UsersRound className="size-4 shrink-0" />,
		visibility: "full",
	},
	{
		title: "Templates",
		url: "/templates",
		icon: <FileIcon className="size-4 shrink-0" />,
		visibility: "nodal_plus",
	},
	{
		title: "Employee",
		url: "/employee",
		icon: <UserIcon className="size-4 shrink-0" />,
		visibility: "nodal_plus",
	},
	{
		title: "Entries",
		url: "/entries",
		icon: <ClipboardListIcon className="size-4 shrink-0" />,
		visibility: "nodal_plus",
	},
	{
		title: "Reports",
		url: "/reports",
		icon: <BarChart3Icon className="size-4 shrink-0" />,
		visibility: "full",
	},
];

function navItemVisible(access: OrgDashboardAccess, item: NavItem): boolean {
	if (item.visibility === "full") return access === "full";
	return access === "full" || access === "nodal";
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { session } = useAuth();
	const { data: activeMember, isError: memberError } =
		useGetActiveOrganizationMember({
			enabled: Boolean(session?.activeOrganizationId),
		});

	const role =
		(!memberError ? activeMember?.role : null) ??
		session?.activeOrganizationRole ??
		null;
	const access = getOrgDashboardAccess(role);

	const items = React.useMemo(
		() => NAV_MAIN.filter((item) => navItemVisible(access, item)),
		[access],
	);

	return (
		<Sidebar {...props} className="bg-sidebar/50">
			<SidebarHeader className="border-b h-16">
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" asChild>
							<Link href={access === "nodal" ? "/templates" : "/dashboard"}>
								<Image src="/logo.png" alt="Shresth" width={35} height={35} />
								<p className="font-extrabold uppercase">
									Shresth
									<span className="text-sm text-muted-foreground lowercase">
										v2
									</span>
								</p>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarMenu className="p-2">
						{items.map((item) => (
							<SidebarMenuItem key={item.url}>
								<SidebarMenuButton asChild>
									<Link
										href={item.url}
										className="font-medium border-l border-transparent hover:border-foreground h-11 px-4 rounded-none hover:bg-card">
										<span className="flex items-center gap-1.5">
											{item.icon}
											{item.title}
										</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						))}
					</SidebarMenu>
				</SidebarGroup>
			</SidebarContent>
			<SidebarRail />
		</Sidebar>
	);
}
