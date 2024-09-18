// Account.jsx
import { useState } from 'react';
//import './account.css'

export default function Account() {
  const [state, setState] = useState(0)

  function changeState() {
    if (state == 0)
      setState(1)
    else
      setState(0)
  }
  return (
    <div className='login-form'>
      {state == 0 ?
        <span>
          <h1>Login</h1>
          <input placeholder="Username or Email"></input>
          <input placeholder="Password"></input>
          <button className="btn">Login</button>
          <p>Don't have an account? <button onClick={()=>changeState()} className="btn2">Register</button></p>
        </span>
        :
        <span>
          <h1>Register</h1>
          <input placeholder="Email"></input>
          <input placeholder="Username"></input>
          <input placeholder="Password" type='password'></input>
          <button className="btn">Register</button>
          <p>Already have an account? <button onClick={()=>changeState()} className="btn2">Login</button></p>
        </span>
      }
      <br></br><br></br>
      <button className="btn">Login with Google</button>

    </div>
  );
}