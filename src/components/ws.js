import React, { useEffect, useState } from 'react';

const WebSocketComponent = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const newSocket = new WebSocket('wss://wssx.gntapi.com:443'); // Change the URL to your WebSocket server

    newSocket.onopen = () => {
      console.log('WebSocket connected');
    };

    newSocket.onmessage = (event) => {
      let newMessage = event.data;
    //   console.log('newMessage',  JSON.parse(newMessage))
    if(typeof newMessage === 'string'){
        newMessage = JSON.parse(newMessage)
    }
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


  // Calculate the index of the first and last item of the current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  // Slice the array of messages to display only the messages for the current page
  const currentMessages = messages.slice(0, 10);

  // Function to handle pagination button clicks
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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

      <div>
      <h2>Forex Prices</h2>
      <table>
        <thead>
          <tr>
            <th>Currency Pair</th>
            <th>Bid Price</th>
            <th>Ask Price</th>
          </tr>
        </thead>
        <tbody>
            {currentMessages.map((message, index) => 
             ( 
                    Object.entries(message.prices).map(([currencyPair, { bid, ask }]) => (
                        <tr key={currencyPair}>
                          <td>{currencyPair}</td>
                          <td>{bid}</td>
                          <td>{ask}</td>
                        </tr>
                      ))
                )
            )}
        </tbody>
      </table>
    </div>
     {/* Pagination buttons */}
     <div>
        {Array.from({ length: Math.ceil(messages.length / itemsPerPage) }).map((_, index) => (
          <button key={index} onClick={() => paginate(index + 1)}>
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default WebSocketComponent;
