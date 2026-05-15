import {Link} from "react-router"

const Register = () => {
  return (
    <main>
      <div className='form-container'>
        <h2 className='heading'>Register with email</h2>
        <form>
        <div className='input-group'>
            <label htmlFor='name'>Full Name</label>
            <input type='name' name="name" placeholder='Enter Full Name' required />
          </div>
          <div className='input-group'>
            <label htmlFor='email'>Email</label>
            <input type='email' name="email" placeholder='Enter Email address' required />
          </div>
          <div className='input-group'>
            <label htmlFor='password'>Password</label>
            <input type='password' name="password" placeholder='Enter Password' required />
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