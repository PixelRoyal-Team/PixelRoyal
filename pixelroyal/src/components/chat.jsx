import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
//import { io } from 'socket.io-client';
import socket from './socket';

import './chat.css'
import { verify } from '../App';

/*const URL = 'http://localhost:4000';
const socket = io(URL);*/

const ChatContentStyle = {
  flex: '1',
  display: 'flex',
  overflowY: 'scroll',
  padding: '0.5rem',
  overFlowX: 'none',
  flexDirection: 'column-reverse'
}

export default function Chat({ show }) {

  const ChatBoxStyle = {
    height: '17rem',
    backgroundColor: 'white',
    border: "1px solid rgb(80,80,80)",
    borderRadius: "7px",
    position: 'absolute',
    right: '5px',
    top: '5px',
    display: 'flex',
    flexDirection: 'column',
    width: '18rem',
    opacity: show ? '0.9' : '0',
    pointerEvents: show ? 'auto' : 'none'
  }

  const chatRef = useRef(null);
  const chatContentRef = useRef(null);
  const [name, setName] = useState("")

  useState(() => {
    const v = verify()
    if (v)
      setName(v.name)
  }, [])

  const Message = ({ user, msg, time }) => {
    return <div className='chatmsg'><div style={{ display: 'flex' }}><b>{user}  </b><p>{msg}</p></div><span id="chattime">{new Date(time).toLocaleTimeString()}</span></div>;
  }

  useEffect(() => {
    socket.on('chat', (data) => {
      const { name, text, time } = JSON.parse(data)
      const message = document.createElement('div');
      chatContentRef.current.prepend(message);
      ReactDOM.render(<Message user={name} msg={text} time={time} />, message);
      console.log("chat gotten");
    });
    return () => {
      socket.off('chat');
    };
  }, []);

  function sendmsg(msg) {
    socket.emit("chat", JSON.stringify({ name: name, text: msg, time: new Date().getTime() }));
    console.log("sent msg:" + msg);
  }

  return (
    <div id="chatbox" style={ChatBoxStyle}>
      <div ref={chatContentRef} id="chatcontent" style={ChatContentStyle}>
      </div>
      <div id="bar">
        {name == "" ? <p>You must be loggedin to chat</p> :
          <><input ref={chatRef} type="text" placeholder='Message...'></input><button onClick={() => sendmsg(chatRef.current.value)}>Send</button></>
        }
      </div>
    </div>
  );
}

