import React, { useEffect } from 'react';
import { io } from 'socket.io-client';

import Viewport from './canvas/Viewport';
//import Chatbox from './components/Chatbox';
import Buttons from './ui/Buttons';

import CryptoJS from 'crypto-js'
import { Buffer } from 'buffer';
window.Buffer = window.Buffer || Buffer

import './App.css';


export default function App() {
  return (
    <main>
      <Viewport />
	  <Buttons bar="corner" />
	  <Buttons bar="palette" />
	  <Buttons bar="side" />
    </main>
  )
}
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

export function verify() {
  var token = localStorage.getItem("token")
  if (token) {
    var decryptedToken = decrypt(token, process.env.KEY, process.env.IV)
    if (decryptedToken) {
      if (JSON.parse(decryptedToken)) {
        decryptedToken = JSON.parse(decryptedToken)
        if (decryptedToken.name && decryptedToken.email && decryptedToken.id) {
          return ({ id: decryptedToken.id, name: decryptedToken.name, email: decryptedToken.email })
        } else {
          localStorage.removeItem("token")
          return (false)
        }
      }
    } else {
      localStorage.removeItem("token")
      return (false)
    }
  } else {
    return false
  }
}