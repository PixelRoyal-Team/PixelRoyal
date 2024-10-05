// Account.jsx
import { useEffect, useState } from 'react';
import './account.css'
import { notify } from "./Menu"
import axios from 'axios';
import CryptoJS from 'crypto-js'
import { Spinner } from "react-activity";
import "react-activity/dist/library.css";
import { Buffer } from 'buffer';
window.Buffer = window.Buffer || Buffer

export default function Account() {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [state, setState] = useState(-1)

  const decrypt = (encryptedText, key, iv) => {
    const keyHex = CryptoJS.enc.Hex.parse(Buffer.from(key).toString('hex'));
    const ivHex = CryptoJS.enc.Hex.parse(Buffer.from(iv).toString('hex'));
    const encryptedHex = CryptoJS.enc.Hex.parse(encryptedText);
    const encryptedBase64 = CryptoJS.enc.Base64.stringify(encryptedHex);
  
    const decrypted = CryptoJS.AES.decrypt(encryptedBase64, keyHex, {
      iv: ivHex,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
  
    return decrypted.toString(CryptoJS.enc.Utf8);
  };
  
  function checkToken() {
    var token = localStorage.getItem("token")
    if (token) {
      var decryptedToken = decrypt(token, process.env.KEY, process.env.IV)
      if (decryptedToken) {
        if (JSON.parse(decryptedToken)) {
          decryptedToken = JSON.parse(decryptedToken)
          if (decryptedToken.name && decryptedToken.email && decryptedToken.id) {
            setName(decryptedToken.name)
            setEmail(decryptedToken.email)
            if (state == 1 || state == 0)
              setTimeout(() => {
                axios.get(`${window.location.protocol}//${window.location.host}/getAdminLevel/${decryptedToken.id}`)
                  .then(function (response) {
                    if (response.data.admin_level > 0) {
                      window.location.reload()
                    }
                  })
              }, 500)
            setState(3)
          } else {
            localStorage.removeItem("token")
            setState(0)
          }
        }
      } else {
        setState(0)
        localStorage.removeItem("token")
      }
    } else {
      setState(0)
    }
  }
  useEffect(() => {
    checkToken()
  }, [])

  const [captcha, setCaptcha] = useState("")
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [registerName, setRegisterName] = useState("")
  const [registerCaptcha, setRegisterCaptcha] = useState("")
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")

  function modifyStr(str) {
    var newstr = ""
    for (var i = 0; i < str.length; i++) {
      if (str[i] != "/" && str[i] != "`" && str[i] != "'" && str[i] != "\"")
        newstr += str[i]
    }
    return newstr
  }

  const handleChange = (event) => {
    switch (event.target.name) {
      case "regemail":
        setRegisterEmail(modifyStr(event.target.value));
        break;
      case "name":
        setRegisterName(modifyStr(event.target.value));
        break;
      case "regpass":
        setRegisterPassword(modifyStr(event.target.value));
        break;
      case "captcha":
        setRegisterCaptcha(modifyStr(event.target.value));
        break;
      case "loginemail":
        setLoginEmail(modifyStr(event.target.value))
        break;
      case "loginpass":
        setLoginPassword(modifyStr(event.target.value))
        break;
    }
  };

  const validateEmail = (email) => {
    return email.match(
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
  };

  const handleRegisterSubmit = (event) => {
    event.preventDefault();
    if (registerEmail.length == 0 || registerCaptcha.length == 0 || registerName.length == 0 || registerPassword.length == 0) {
      notify("Fill up the boxes", "error");
      return
    }
    if (!validateEmail(registerEmail)) {
      notify("Email is not valid", "error");
      return
    }
    axios.post(`${window.location.protocol}//${window.location.host}/register/${registerEmail}/${registerPassword}/${registerName}/${registerCaptcha}`)
      .then(function (response) {
        notify(response.data.message, "success")
        setCaptcha(`${window.location.protocol}//${window.location.host}/captcha.png?${Math.random() * 21}`)
      })
      .catch(function (error) {
        if (error.response.status == 400) {
          notify(error.response.data.message, "error")
          setCaptcha(`${window.location.protocol}//${window.location.host}/captcha.png?${Math.random() * 21}`)
        }
      });
  }

  const handleLoginSubmit = (event) => {
    event.preventDefault();
    if (loginEmail.length == 0 || loginPassword.length == 0) {
      notify("Fill up the boxes", "error");
      return
    }
    if (!validateEmail(loginEmail)) {
      notify("Email is not valid", "error");
      return
    }
    axios.get(`${window.location.protocol}//${window.location.host}/login/${loginEmail}/${loginPassword}`)
      .then(function (response) {
        notify("Loggedin", "success")
        localStorage.setItem("token", response.data.token)
        checkToken()
      })
      .catch(function (error) {
        if (error.response.status == 400) {
          notify(error.response.data.message, "error")
        }
      });

  }

  function changeState() {
    if (state == 0) {
      setCaptcha(`${window.location.protocol}//${window.location.host}/captcha.png`)
      setState(1)
    } else
      setState(0)
  }
  if (state == 0 || state == 1)
    return (
      <div className='login-form'>
        {state == 0 ?
          <form onSubmit={handleLoginSubmit}>
            <h1>Login</h1>
            <input name="loginemail" placeholder="Email" type="email" value={loginEmail} onChange={handleChange}></input>
            <input name="loginpass" placeholder="Password" type="password" value={loginPassword} onChange={handleChange}></input>
            <button className="btn" type="submit">Login</button>
            <p>Don't have an account? <button onClick={() => changeState()} className="btn2">Register</button></p>
          </form>
          :
          <form onSubmit={handleRegisterSubmit}>
            <h1>Register</h1>
            <input name="regemail" placeholder="Email" value={registerEmail} onChange={handleChange}></input>
            <input name="name" placeholder="Nickname" value={registerName} onChange={handleChange}></input>
            <input name="regpass" placeholder="Password" type='password' value={registerPassword} onChange={handleChange}></input>
            <img
              height={60}
              src={captcha}
              width={360}
              style={{
                borderRadius: 5
              }}
            />
            <p style={{ fontSize: 12 }}>not case-sensitive</p>
            <input name="captcha" placeholder="Captcha" value={registerCaptcha} onChange={handleChange}></input>
            <button className="btn" type='submit'>Register</button>
            <p>Already have an account? <button onClick={() => changeState()} className="btn2">Login</button></p>
          </form>
        }
      </div>
    );
  else
    return (
      <>
        {state == 3 ?
          <div class="profile">
            <h3>{name}</h3>
            <p>Today Placed Pixels: 0</p>
            <p>Placed Pixels: 0</p>
            <p>Rank: #0</p>
            <button onClick={() => {
              localStorage.removeItem("token")
              window.location.reload()
            }}>LOGOUT</button>
          </div>
          :
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Spinner />
          </div>
        }
      </>
    )
}