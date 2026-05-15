import {Link} from 'react-router';
import '../auth.form.scss';
import {useAuth} from '../hooks/useAuth';
import {useState} from 'react';
const Login = () => {
  const {loading,handleLogin}=useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); 
  
  const handleSubmit = async(e) => {
    e.preventDefault();
    if(!email || !password || email===''|| password==='') return;
    handleLogin({email, password});
  }
  
  if(loading){
    return <div className='loading'>Loading...</div>
  }
  
  return (
    <main>
      <div className='form-container'>
        <h2 className='heading'>Login with email</h2>
        <form onSubmit={handleSubmit}>
          <div className='input-group'>
            <label htmlFor='email'>Email</label>
            <input type='email' name="email" value={email} placeholder='Enter Email address' required onChange={(e)=>setEmail(e.target.value)} />
          </div>
          <div className='input-group'>
            <label htmlFor='password'>Password</label>
            <input type='password' name="password" value={password} placeholder='Enter Password' required onChange={(e)=>setPassword(e.target.value)} />
          </div>
          
          <button type='submit' className='btn-submit'>Login</button>
          
        </form>
        <div className='navigation'>
            <span>Don't have an account?</span><Link to="/register">Register</Link>
          </div>
      </div>
    </main>
  );
};

export default Login;
