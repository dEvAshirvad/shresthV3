// components/wrappers/smooth-scroll.tsx
"use client";

import * as React from "react";
import { ReactLenis } from "lenis/react";

type SmoothScrollProps = {
	children: React.ReactNode;
};

export default function SmoothScroll({ children }: SmoothScrollProps) {
	return <ReactLenis root>{children}</ReactLenis>;
}

