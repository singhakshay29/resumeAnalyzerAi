const Loader = ({
    title = "Loading...",
    message = "Please wait while we process your request."
  }) => {
    return (
      <div className="loader-screen">
        <div className="loader-content">
          <div className="loader-spinner"></div>
  
          <h2>{title}</h2>
  
          <p>{message}</p>
        </div>
      </div>
    );
  };
  
  export default Loader;