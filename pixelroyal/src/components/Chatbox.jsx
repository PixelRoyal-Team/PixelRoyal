import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

// Custom hook to access location.host
const useLocationHost = () => {
  const [host, setHost] = useState('');

  useEffect(() => {
    setHost(window.location.host);
  }, []);

  console.log(host);
  return host;
};

const Chatbox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const chatRef = useRef(null);
  const [connectionError, setConnectionError] = useState(false);
  const host = window.location.hostname; // Cache host name

  // WebSocket connection logic
  const ws = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket(`wss://${host}:8081`); // Use wss:// for secure connection

    ws.current.onopen = () => {
      console.log('Connected to WebSocket server');
      setConnectionError(false);
    };

    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.trim()) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }

      if (chatRef.current) {
        chatRef.current.scrollTop = chatRef.current.scrollHeight;
      }
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionError(true);
    };

    ws.current.onclose = () => {
      console.log('WebSocket connection closed');
      setConnectionError(true);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    // Focus the input field when the chatbox opens
    if (isOpen && chatRef.current) {
      chatRef.current.focus();
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Ensure ws is connected and message is not empty before sending
    if (ws.current && ws.current.readyState === WebSocket.OPEN && input.trim()) {
      try {
        const message = { message: input, host: host }; // Use cached host
        ws.current.send(JSON.stringify(message));
        setInput(''); // Clear input field after sending
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  // Display error message if WebSocket connection fails
  const errorMessage = connectionError ? (
    <div style={{ color: 'red' }}>Error: WebSocket connection failed</div>
  ) : null;

  const StyledChatboxToggle = styled.button`
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 10px 20px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.2s ease-in-out;

    &:hover {
      background-color: #0056b3;
    }
  `;

  const StyledChatboxContainer = styled.div`
    position: fixed;
    bottom: 60px;
    right: 20px;
    width: 300px;
    height: 400px;
    border: 1px solid #ccc;
    background-color: #f9f9f9;
    display: flex;
    flex-direction: column;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    z-index: 999;
    display: ${({ isOpen }) => (isOpen ? "flex" : "none")};
    border-radius: 5px;
  `;

  const StyledChatboxMessages = styled.div`
    flex-grow: 1;
    overflow-y: auto;
  `;

  return (
    <>
      <StyledChatboxToggle onClick={handleToggle}>
        {isOpen ? 'Close Chat' : 'Open Chat'}
      </StyledChatboxToggle>
      <StyledChatboxContainer isOpen={isOpen} ref={chatRef}>
        {errorMessage}
        <StyledChatboxMessages>
          {messages.map((message, index) => (
            <div key={index}>
              {message.message}
            </div>
          ))}
        </StyledChatboxMessages>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter your message"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit">Send</button>
        </form>
      </StyledChatboxContainer>
    </>
  );
};

export default Chatbox;