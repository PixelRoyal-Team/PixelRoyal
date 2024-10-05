import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
//import { io } from 'socket.io-client';
import socket from './socket';

/*const URL = 'http://localhost:4000';
const socket = io(URL);*/

const ChatBoxStyle = {
  height: '320px',
  backgroundColor: 'white',
  border: "2px solid black",
  borderRadius: "5px",
  position: 'absolute',
  right: '0px',
  top: '0px',
  display: 'flex',
  flexDirection: 'column',
}

const ChatContentStyle = {
  flex: '1',
  display: 'flex',
  flexDirection: 'column',
  overflowY: 'scroll',
}

export default function Chat() {
  const chatRef = useRef(null);
  const chatContentRef = useRef(null);
  
  const Message = ( {user, msg} ) => {
	return <p><b>{user}: </b>{msg}</p>;
  }
  
	useEffect(() => {
	  socket.on('chat', (msg) => {
		const message = document.createElement('div');
	    chatContentRef.current.appendChild(message);
		ReactDOM.render(<Message user="User" msg={msg} />, message);
		console.log("chat gotten");
      });
      return () => {
	    socket.off('chat');
      };
    }, []);
  
    function sendmsg(msg) {
	  socket.emit("chat", msg);
	  console.log("sent msg:" + msg);
    }
		
  return (
  <div id="chatbox" style={ChatBoxStyle}>
  <div ref={chatContentRef} id="chatcontent" style={ChatContentStyle}>
  </div>
  <div id="bar">
  <input ref={chatRef} type="text"></input><button onClick={() => sendmsg(chatRef.current.value)}>Send</button>
  </div>
  </div>
  );
}