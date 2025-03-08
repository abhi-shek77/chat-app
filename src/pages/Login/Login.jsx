import React, { useState } from 'react'
import './Login.css'
import assets from '../../assets/assets'
import { signup, login} from '../../config/firebase'

const Login = () => {

    const [currState, setCurrState] = useState('Sign Up')
    const [userName, setUserName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const onSubmitHandler = (event) =>{
      event.preventDefault();
      if (currState === 'Sign Up') {
        signup(userName,email,password)
        console.log(userName,email,password);
      }
      else{
        login(email,password)
      }
    }

  return (
    <div>
      <div className="login">
        <img src={assets.logo_big} className='logo' />
        <form onSubmit={onSubmitHandler} className="login-form">
            <h2>{currState}</h2>
            {currState === 'Sign Up'?<input onChange={(e)=>setUserName(e.target.value)} value={userName} type="text"  placeholder='username' className="form-input" required />:null}
            <input onChange={(e)=>setEmail(e.target.value)} value={email} type="email" placeholder='Email Address' className="form-input" required />
            <input onChange={(e)=>setPassword(e.target.value)} value={password} type="password" placeholder='password' className="form-input" required />
            <button type='submit'>{currState === 'Sign Up'?'Create Account':'Login Now'}</button>
            <div className="login-term">
                <input type="checkbox" />
                <p>Agree to the term of use and privacy policy.</p>
            </div>
            <div className="login-toggle">
                {
                    currState === 'Sign Up'
                    ?<p>Already have an account <span onClick={()=>setCurrState('Login')}>Login here</span></p>
                    :<p>Create an account <span onClick={()=>setCurrState('Sign Up')}>click here</span></p>
                }
            </div>
        </form>
      </div>
    </div>
  )
}

export default Login
