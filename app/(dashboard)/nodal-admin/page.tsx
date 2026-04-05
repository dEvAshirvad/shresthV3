import { redirect } from "next/navigation";

/** @deprecated Use `/admin` or `/nodal`. */
export default function NodalAdminRedirectPage() {
	redirect("/admin");
}
