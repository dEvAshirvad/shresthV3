import * as React from "react";

import { cn } from "@/lib/utils";

function Card({
	className,
	size = "default",
	variant = "default",
	...props
}: React.ComponentProps<"div"> & {
	size?: "default" | "sm";
	variant?: "default" | "inset";
}) {
	return (
		<div
			data-slot="card"
			data-size={size}
			data-variant={variant}
			className={cn(
				"group/card flex flex-col gap-4 overflow-hidden bg-card text-sm text-card-foreground transition-shadow",
				"hover:shadow-[0_8px_32px_0_rgba(26,28,24,0.06)]",
				variant === "inset" &&
					"bg-input hover:shadow-[0_8px_32px_0_rgba(26,28,24,0.06)]",
				size === "default" && "p-6",
				size === "sm" && "gap-3 p-5",
				"has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:has-data-[slot=card-footer]:pb-0",
				className,
			)}
			{...props}
		/>
	);
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="card-header"
			className={cn(
				"group/card-header @container/card-header grid auto-rows-min items-start gap-2 px-0 group-data-[size=sm]/card:gap-1.5 has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto]",
				className,
			)}
			{...props}
		/>
	);
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="card-title"
			className={cn(
				"font-heading text-lg font-bold leading-snug tracking-tight group-data-[size=sm]/card:text-base",
				className,
			)}
			{...props}
		/>
	);
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="card-description"
			className={cn(
				"text-sm leading-relaxed text-muted-foreground group-data-[size=sm]/card:text-sm",
				className,
			)}
			{...props}
		/>
	);
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="card-action"
			className={cn(
				"col-start-2 row-span-2 row-start-1 self-start justify-self-end",
				className,
			)}
			{...props}
		/>
	);
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="card-content"
			className={cn("px-0 group-data-[size=sm]/card:px-0", className)}
			{...props}
		/>
	);
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="card-footer"
			className={cn(
				"flex items-center gap-2 pt-4 group-data-[size=sm]/card:pt-3",
				className,
			)}
			{...props}
		/>
	);
}

export {
	Card,
	CardHeader,
	CardFooter,
	CardTitle,
	CardAction,
	CardDescription,
	CardContent,
};
