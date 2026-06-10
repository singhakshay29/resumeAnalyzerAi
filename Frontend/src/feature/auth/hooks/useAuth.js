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
      return {
        success: true,
        user: response.user,
      };
    } catch (error) {
      // eslint-disable-next-line no-useless-assignment
      let message = "Something went wrong";
      if (!error.response) {
        message = "Unable to connect to server. Please try again later.";
      } else {
        message = error.message || "Login failed";
      }
      return {
        success: false,
        message
      };
    } finally {
      setLoading(false);
    }
  };

  const handleResgister = async ({ userName, email, password }) => {
    setLoading(true);
    try {
      const response = await registerUser({ userName, email, password });
      setUser(response.user);
      return {
        success: true,
        user: response.user,
      };
    } catch (error) {
      // eslint-disable-next-line no-useless-assignment
      let message = "Something went wrong";
      if (!error.response) {
        message = "Unable to connect to server. Please try again later.";
      } else {
        message = error.message || "Login failed";
      }
      return {
        success: false,
        message
      };
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      setUser(null);
      return {
        success: true,
        message: "Logged out successfully",
      };
    } catch (error) {
      
      return {
        success: false,
        message:
          error ||
          "Failed to logout",
      };
    } finally {
      setLoading(false);
    }
  };
  return { user, loading, handleLogin, handleResgister, handleLogout };
};
