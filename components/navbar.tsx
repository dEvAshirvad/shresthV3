"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useLenis } from "lenis/react";
import { SocialSigninBtn } from "./social-signin-btn";

const nav = [
	{ href: "#features", label: "Features" },
	{ href: "#how-it-works", label: "How it Works" },
	{ href: "#contact", label: "Contact" },
];

export function Navbar() {
	const [open, setOpen] = useState(false);
	const lenis = useLenis();

	return (
		<header className="sticky top-0 z-50 bg-background/80 backdrop-blur-[20px]">
			<div className="flex items-center justify-between container h-24">
				<div className="flex items-center gap-4">
					<Image
						src="/logo.png"
						alt="Shresth"
						width={50}
						height={50}
						unoptimized
						priority
					/>
					<Link
						href="/"
						className="font-(family-name:--font-public-sans) uppercase text-xl font-bold tracking-tight text-primary">
						Shresth
						<span className="lowercase text-muted-foreground text-sm">v2</span>
					</Link>
				</div>
				<nav className="hidden flex-1 items-center gap-4 relative justify-center md:flex">
					{nav.map((item) => (
						<Link
							key={item.href}
							href={item.href}
							onClick={(e) => {
								if (!lenis) return;
								e.preventDefault();
								lenis.scrollTo(item.href, {
									offset: -6,
									duration: 1.0,
								});
							}}
							className={[
								"text-sm",
								"px-3 py-3",
								"text-foreground",
								"relative",
								"after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-full after:bg-foreground after:origin-right after:scale-x-0",
								"hover:after:origin-left hover:after:scale-x-100 after:transition-transform after:duration-300 after:ease-out",
								"transition-colors",
							].join(" ")}>
							{item.label}
						</Link>
					))}
				</nav>
				<div className="md:flex hidden items-center gap-2">
					<SocialSigninBtn />
					<Link
						href="#"
						data-slot="button"
						data-variant="default"
						data-size="lg"
						className={cn(buttonVariants({ variant: "default", size: "lg" }))}>
						Demo
					</Link>
				</div>
				<div className="flex items-center gap-2 md:hidden">
					<Button asChild size="sm">
						<Link href="/signup">Get Started</Link>
					</Button>
					<Button
						variant="ghost"
						size="sm"
						aria-expanded={open}
						aria-controls="mobile-nav"
						onClick={() => setOpen((v) => !v)}>
						Menu
					</Button>
				</div>
			</div>
			{open ? (
				<div id="mobile-nav" className="bg-muted/40 px-4 py-4 md:hidden">
					<nav className="flex flex-col gap-3">
						{nav.map((item) => (
							<Link
								key={item.href}
								href={item.href}
								className="text-sm font-medium text-muted-foreground"
								onClick={(e) => {
									if (!lenis) return;
									e.preventDefault();
									lenis.scrollTo(item.href, {
										offset: -6,
										duration: 1.0,
									});
									setOpen(false);
								}}>
								{item.label}
							</Link>
						))}
					</nav>
				</div>
			) : null}
		</header>
	);
}
