import {useState} from "react";
import {Link, useNavigate} from "react-router"
import {useAuth} from "../hooks/useAuth";

const Register = () => {
  const navigate = useNavigate();
  const {loading, handleResgister} = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!name || !email || !password || name === '' || email === '' || password === '') return;
    await handleResgister({userName:name, email, password});
    navigate('/');
  }
  
  if(loading){
    return <div className='loading'>Loading...</div>
  }

  return (
    <main>
      <div className='form-container'>
      <h2 className='heading'>Create Your Account</h2>
        <form onSubmit={handleSubmit}>
        <div className='input-group'>
            <label htmlFor='name'>Full Name</label>
            <input type='name' value={name} name="name" placeholder='Enter Full Name' required  onChange={(e)=>setName(e.target.value)}/>
          </div>
          <div className='input-group'>
            <label htmlFor='email'>Email</label>
            <input type='email' value={email} name="email" placeholder='Enter Email address' required onChange={(e)=>setEmail(e.target.value)}/>
          </div>
          <div className='input-group'>
            <label htmlFor='password'>Password</label>
            <input type='password' value={password} name="password" placeholder='Enter Password' required onChange={(e)=>setPassword(e.target.value)}/>
          </div>
          
          <button type='submit' className='btn-submit'>Register</button>
          <div className="navigation">
            <span>Already have an account?</span>
            <Link to="/login">Login</Link>
          </div>
        </form>
      </div>
    </main>
  )
}

export default Register