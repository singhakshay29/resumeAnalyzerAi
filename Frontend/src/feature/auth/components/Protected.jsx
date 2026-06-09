import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { Outlet, useNavigate } from "react-router";
import {Navbar} from "../../../components/Navbar";

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

const ProtectedLayout = () => {
  return (
    <>
      <Navbar />
      <div className="gap">
      <Outlet />
      </div>
    </>
  );
};

export {ProtectedLayout};

export default Protected;
