import {useNavigate} from "react-router";


export const Navbar = () => {
    const navigate = useNavigate();
    const handleGetAllReport = () => {
        navigate("/reports");
      };
    
  return (
    <nav className="navbar">
    <div className="navbar-container">
      <h1 className="navbar-logo">
        Resume Analysis
      </h1>
  
      <div className="navbar-actions">
        <button className="navbar-link">
          Features
        </button>
  
        <button className="navbar-link" onClick={()=>handleGetAllReport()}>
          Reports
        </button>
  
        <button className="navbar-btn">
          Get Started
        </button>
      </div>
    </div>
  </nav>
  )
}
