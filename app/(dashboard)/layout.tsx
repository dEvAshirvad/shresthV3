import { AppSidebar } from "@/components/app-sidebar";
import AppSidebarHeader from "@/components/app-sidebar-header";
import { DashboardRoleGate } from "@/components/dashboard-role-gate";
import { ProtectedRoute } from "@/components/providers/auth-provider";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

function DashboardLayout({ children }: { children: React.ReactNode }) {
	return (
		<ProtectedRoute>
			<DashboardRoleGate>
				<SidebarProvider>
					<AppSidebar />
					<SidebarInset className="relative">
						<AppSidebarHeader />
						<div className="flex flex-1 flex-col gap-4 p-10">{children}</div>
					</SidebarInset>
				</SidebarProvider>
			</DashboardRoleGate>
		</ProtectedRoute>
	);
}

export default DashboardLayout;
