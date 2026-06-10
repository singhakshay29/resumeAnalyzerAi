import { useContext } from "react";
import { AuthContext } from "../auth.context";
import { loginUser, logoutUser, registerUser } from "../services/auth.api";

const getErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.code === "ERR_NETWORK") {
    return "Unable to connect to server. Please try again later.";
  }

  return error.message || "Something went wrong";
};

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
      return {
        success: false,
        message: getErrorMessage(error),
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
      return {
        success: false,
        message: getErrorMessage(error),
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
