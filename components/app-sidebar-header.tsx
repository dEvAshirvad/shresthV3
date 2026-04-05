"use client";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "./ui/sidebar";
import { usePathname } from "next/navigation";
import React from "react";

function AppSidebarHeader() {
	const pathname = usePathname();
	return (
		<header className="flex h-16 shrink-0 items-center gap-2 border-b sticky top-0 bg-background z-10">
			<div className="flex items-center gap-2 px-3">
				<SidebarTrigger />
				<Separator
					orientation="vertical"
					className="mr-2 data-vertical:h-4 data-vertical:self-auto"
				/>
				<Breadcrumb>
					<BreadcrumbList className="capitalize">
						<BreadcrumbItem>
							<BreadcrumbLink href="">System</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator />
						{pathname
							.split("/")
							.slice(1)
							.map((path, index) => (
								<React.Fragment key={index}>
									<BreadcrumbItem>
										<BreadcrumbLink href={`/${path}`}>{path}</BreadcrumbLink>
									</BreadcrumbItem>
									{index < pathname.split("/").length - 2 && (
										<BreadcrumbSeparator />
									)}
								</React.Fragment>
							))}
					</BreadcrumbList>
				</Breadcrumb>
			</div>
		</header>
	);
}

export default AppSidebarHeader;
