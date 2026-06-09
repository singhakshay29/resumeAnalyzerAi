import {useNavigate} from "react-router";
import {logoutUser} from "../feature/auth/services/auth.api";


export const Navbar = () => {
    const navigate = useNavigate();
    const handleGetAllReport = () => {
        navigate("/reports");
      };
    const handleLogout = ()=>{
        logoutUser();
        navigate("/");
    }  
    
  return (
    <nav className="navbar">
    <div className="navbar-container">
    <div className="navbar-brand">
  <span className="brand-icon">⚡</span>
  <div>
    <h1>ResumeAI</h1>
    <span>Interview Assistant</span>
  </div>
</div>
  
      <div className="navbar-actions">
  
        <button className="navbar-link" onClick={()=>handleGetAllReport()}>
          History
        </button>
  
        <button className="navbar-btn" onClick={()=>handleLogout()}>
          Log out
        </button>
      </div>
    </div>
  </nav>
  )
}
