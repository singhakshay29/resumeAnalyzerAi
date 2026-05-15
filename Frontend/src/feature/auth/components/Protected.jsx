import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router";

const Protected = ({ children }) => {
  const { loading, user } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [loading,user,navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }
 
  return children;
};

export default Protected;
