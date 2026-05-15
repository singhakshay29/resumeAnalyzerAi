import { useContext } from "react";
import { AuthContext } from "../auth.context";
import { loginUser, logoutUser, registerUser } from "../services/auth.api";

export const useAuth = () => {
  const context = useContext(AuthContext);
  const { user, setUser, loading, setLoading } = context;

  const handleLogin = async ({ email, password }) => {
    setLoading(true);
    try {
      const response = await loginUser({ email, password });
      setUser(response.user);
    } catch (error) {
      console.log("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResgister = async ({ userName, email, password }) => {
    setLoading(true);
    try {
      const response = await registerUser({ userName, email, password });
      setUser(response.user);
    } catch (error) {
      console.log("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      setUser(null);
    } catch (error) {
      console.log("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };
  return { user, loading, handleLogin, handleResgister, handleLogout };
};
