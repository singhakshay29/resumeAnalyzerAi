import { createContext, useEffect, useState } from "react";
import { getCurrentUser } from "./services/auth.api";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const getUser = async () => {
      setLoading(true);
      try {
        const response = await getCurrentUser();
        setUser(response.user);
        setLoading(false);
      } catch (error) {
        console.log("Error fetching user:", error);
      }
    };
    getUser();
  }, []);
  return (
    <AuthContext.Provider value={{ user, setUser, loading, setLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
