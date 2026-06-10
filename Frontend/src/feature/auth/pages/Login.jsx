import { Link, useNavigate } from "react-router";
import "../auth.form.scss";
import { useAuth } from "../hooks/useAuth";
import { useEffect, useState } from "react";
import Loader from "../../../components/Loader";
const Login = () => {
  const navigate = useNavigate();
  const { loading, handleLogin, user } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    const result = await handleLogin({
      email,
      password,
    });
    if (result.success) {
      navigate("/");
    } else {
      setError(result.message);
    }
  };

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  if (loading) {
    return  <Loader
    title="Checking Authentication"
    message="Verifying your account and preparing your workspace."
  />;
  }

  return (
    <main>
      <section className='main'>
        <span className='tag'>AI Career Assistant</span>
        <div className='herocontent'>
          <h1>
            Accelerate Your
            <span> Career Growth</span>
          </h1>

          <p className='p-section'>
            Create an account to unlock AI-powered resume analysis, ATS scoring,
            personalized interview preparation, and actionable career insights
            tailored to your target role.
          </p>

          <div className='features'>
            <div>✓ Resume Analysis</div>
            <div>✓ ATS Compatibility Score</div>
            <div>✓ Skill Gap Identification</div>
            <div>✓ Personalized Interview Questions</div>
            <div>✓ AI-Powered Career Recommendations</div>
          </div>
        </div>
      </section>
      <div className='form-container'>
        <h2 className='heading'>Welcome Back</h2>
        <p className='sub-heading'>
          Login to generate AI-powered interview reports
        </p>
        <form onSubmit={handleSubmit}>
          <div className='input-group'>
            <label htmlFor='email'>Email</label>
            <input
              type='email'
              name='email'
              value={email}
              placeholder='Enter Email address'
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className='input-group'>
            <label htmlFor='password'>Password</label>
            <div className='password-field'>
              <input
                type={showPassword ? "text" : "password"}
                name='password'
                value={password}
                placeholder='Enter Password'
                required
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                type='button'
                className='toggle-password'
                onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>
          {error && <div className='error-message'>{error}</div>}

          <button type='submit' className='btn-submit' disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <div className='navigation'>
          <span>Don't have an account?</span>
          <Link to='/register'>Register</Link>
        </div>
      </div>
    </main>
  );
};

export default Login;
