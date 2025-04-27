"use client";

// React
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Types
import { UserType, AuthContextType } from "@/types";

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => null,
  isLoading: false,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // States
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Effects
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch("/api/users/auth/me");

        // No token or error
        if (response.status === 401 || !response.ok) {
          setIsLoading(false);
          setUser(null);
          return;
        }

        // Success
        const data = await response.json();
        if (data.user) setUser(data.user);
      } catch (error) {
        console.error("Error checking auth status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Check if user is already logged in (using JWT cookie)
    checkAuthStatus();
  }, []);

  return <AuthContext.Provider value={{ user, setUser, isLoading }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
