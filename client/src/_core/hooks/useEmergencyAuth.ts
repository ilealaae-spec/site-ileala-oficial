import { useState, useEffect, useMemo } from "react";

type EmergencyUser = {
  id: number;
  email: string;
  name: string;
  role: string;
  emergency: boolean;
};

export function useEmergencyAuth() {
  const [emergencyUser, setEmergencyUser] = useState<EmergencyUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for emergency admin session
    const checkEmergencySession = () => {
      try {
        const sessionData = localStorage.getItem("emergency_admin_session");
        if (sessionData) {
          const user = JSON.parse(sessionData);
          setEmergencyUser(user);
        }
      } catch (error) {
        console.error("Error loading emergency session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkEmergencySession();
  }, []);

  const logout = () => {
    localStorage.removeItem("emergency_admin_session");
    document.cookie = "__session=; path=/; max-age=0";
    setEmergencyUser(null);
  };

  const state = useMemo(() => {
    return {
      user: emergencyUser,
      isLoading,
      error: null,
      isAuthenticated: Boolean(emergencyUser),
      isEmergency: emergencyUser?.emergency === true,
    };
  }, [emergencyUser, isLoading]);

  return {
    ...state,
    logout,
    refresh: () => {
      // Reload emergency session
      const sessionData = localStorage.getItem("emergency_admin_session");
      if (sessionData) {
        setEmergencyUser(JSON.parse(sessionData));
      }
    },
  };
}
