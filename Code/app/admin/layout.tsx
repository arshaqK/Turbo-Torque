"use client";

// React
import React from "react";

// Contexts
import { useAuth } from "@/context/AuthContext";

// Components
import Protected from "../components/Protected";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Hooks
  const { user, isLoading } = useAuth();

  // Don't show the content until we know that the user is authenticated
  if (user && user.role !== "admin") {
    return <p className="mt-[5rem]">Not authorized.</p>;
  }

  if (isLoading || !user || user.role !== "admin") {
    return <p className="mt-[5rem]">Loading...</p>;
  }

  return <Protected>{children}</Protected>;
}
