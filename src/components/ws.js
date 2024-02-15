import React, { useEffect, useState } from 'react';

const WebSocketComponent = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = new WebSocket('wss://wssx.gntapi.com:443'); // Change the URL to your WebSocket server

    newSocket.onopen = () => {
      console.log('WebSocket connected');
    };

    newSocket.onmessage = (event) => {
      const newMessage = event.data;
      console.log('newMessage', newMessage)
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    };

    newSocket.onclose = () => {
      console.log('WebSocket closed');
    };

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const sendMessage = () => {
    if (inputMessage.trim() !== '') {
      console.log('sendMessage', inputMessage)
      socket.send(inputMessage);
      setInputMessage('');
    }
  };

  return (
    <div>
      <h2>WebSocket Messages:</h2>
      <input
        type="text"
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        placeholder="Type your message..."
      />
      <button onClick={sendMessage}>Send</button>
      <ul>
        {messages.map((message, index) => (
          <li key={index}>{message}</li>
        ))}
      </ul>
    </div>
  );
};

export default WebSocketComponent;
