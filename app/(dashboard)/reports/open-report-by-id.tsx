"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function OpenReportById() {
	const router = useRouter();
	const [periodId, setPeriodId] = useState("");

	const go = () => {
		const id = periodId.trim();
		if (!id) return;
		router.push(`/reports/${encodeURIComponent(id)}`);
	};

	return (
		<div className="grid max-w-md gap-3">
			<Label htmlFor="rep-period-open">Open by period ID</Label>
			<div className="flex flex-wrap gap-2">
				<Input
					id="rep-period-open"
					placeholder="Paste a period ObjectId"
					value={periodId}
					onChange={(e) => setPeriodId(e.target.value)}
					className="min-w-0 flex-1 font-mono text-sm"
					onKeyDown={(e) => {
						if (e.key === "Enter") go();
					}}
				/>
				<Button type="button" onClick={go} disabled={!periodId.trim()}>
					Open
				</Button>
			</div>
			<p className="text-muted-foreground text-xs">
				Use this if a run exists but is not shown in the table, or you have the
				id from another screen.
			</p>
		</div>
	);
}
