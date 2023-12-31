import React, { useState, useEffect } from 'react';
import Input from './components/Input';
import ChatInterface from './components/ChatInterface';
import './styles/styles.css';

// Main component 
const App = () => {
  // State to control whether to show the chat interface
  const [showChat, setShowChat] = useState(false);

  // onSubmit passed to Input component
  const handleSubmission = () => {
    setShowChat(true);
  }

  // Free tier of Pinecone only allows one index so delete the old one
  useEffect(() => {
    return () => {
      fetch('http://localhost:5000/delete-index', {
        method: 'POST',
      }).then((response) => {
        if (!response.ok) {
          console.error('Error deleting index:', response.statusText);
        }
      }).catch((error) => {
        console.error('Error:', error)
      })
    }
  }, []);

  return (
    <div className='App'>
      {!showChat ? (
        <Input onSubmit={handleSubmission}></Input>
      ) : (
        <ChatInterface />
      )}
    </div>
  )
}

export default App;
