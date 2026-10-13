import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../feature/auth/hooks/useAuth";


export const Navbar = () => {
  const navigate = useNavigate();
  const { handleLogout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogoutClick = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await handleLogout();
    } finally {
      navigate("/login", { replace: true });
      setLoggingOut(false);
    }
  };
    
  return (
    <nav className="navbar" aria-label="Main navigation">
    <div className="navbar-container">
      <button className="navbar-brand" type="button" onClick={() => navigate("/")} aria-label="ResumeAI home">
        <span className="brand-icon" aria-hidden="true">✦</span>
        <span className="brand-copy">
          <span className="brand-name">Resume<span className="brand-accent">AI</span></span>
          <span className="brand-caption">Career copilot</span>
        </span>
      </button>

      <div className="navbar-actions">
        <button className="navbar-link" type="button" onClick={() => navigate("/reports")}>
          Reports
        </button>

        <button className="navbar-btn" type="button" onClick={handleLogoutClick} disabled={loggingOut}>
          {loggingOut ? "Logging out…" : "Log out"}
        </button>
      </div>
    </div>
  </nav>
  )
}
