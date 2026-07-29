"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOutIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/api-error";
import { useSignOut } from "@/queries/auth";

export function NotAssignedActions() {
  const router = useRouter();
  const signOut = useSignOut();

  const handleSignOut = async () => {
    try {
      await signOut.mutateAsync();
      toast.success("Signed out");
      router.replace("/");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        onClick={() => void handleSignOut()}
        disabled={signOut.isPending}
      >
        <LogOutIcon className="size-4" />
        {signOut.isPending ? "Signing out…" : "Sign out"}
      </Button>
      <Button variant="outline" asChild>
        <Link href="/dashboard">Retry access</Link>
      </Button>
    </div>
  );
}
