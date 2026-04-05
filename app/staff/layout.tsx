import { StaffHomeGate } from "@/components/staff-home-gate";
import { ProtectedRoute } from "@/components/providers/auth-provider";

export default function StaffLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<ProtectedRoute>
			<StaffHomeGate>{children}</StaffHomeGate>
		</ProtectedRoute>
	);
}
