"use client";

// React
import { ReactNode, useEffect } from "react";

// Next Js
import { useRouter } from "next/navigation";

// Contexts
import { useAuth } from "@/context/AuthContext";

// Interfaces
interface ProtectedProps {
  children: ReactNode;
}

export default function Protected({ children }: ProtectedProps) {
  // Hooks
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Effects
  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return user ? <>{children}</> : null;
}
