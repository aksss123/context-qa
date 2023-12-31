import React, { useState, useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';

// Component to type and show messages
const ChatInterface = () => {
    // All the messages to and from API
    const [messages, setMessages] = useState([]);
    // Message from user
    const [inputText, setInputText] = useState('');
    // Used for auto scroll down
    const messagesEndRef = useRef(null);

    // Scroll list of chats down to the most reccent
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Keep chat feed at bottom every time a new message appears
    useEffect(scrollToBottom, [messages]);

    // Sending a message to GPT
    const handleSendMessage = async (event) => {
        event.preventDefault();

        // Don't send empty messages
        if (!inputText.trim()) {
            return;
        }

        // Messages including current and past
        const userMessage = { text: inputText, isBot: false };
        const body = {
            chatHistory: ([...messages, userMessage]),
            question: inputText
        }

        // Placeholder bot message
        const botMessage = { text: '', isBot: true }
        setMessages([...messages, userMessage, botMessage]);
        setInputText('');

        // Make a request to handle the query
        const response = await fetch('http://localhost:5000/handle-query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (!response.body) return;

        // Setup to handle response stream
        let decoder = new TextDecoderStream();
        const reader = response.body.pipeThrough(decoder).getReader();
        let accumulatedAnswer = '';

        // Read the stream until finished and updated the answer
        // This results in the ChatGPT effect of having the text
        // write out little by little
        while (true) {
            var { value, done } = await reader.read();
            if (done) break;
            accumulatedAnswer += value;

            setMessages(currentHistory => {
                const updatedHistory = [...currentHistory]
                const lastChatIndex = updatedHistory.length - 1
                updatedHistory[lastChatIndex] = {
                    ...updatedHistory[lastChatIndex],
                    text: accumulatedAnswer
                }
                return updatedHistory
            })
        }
    }

    return (
        <div className='chat-container'>
            <header className='chat-header'>Context based question and answer</header>
            {
                messages.length === 0
                &&
                <div className='chat-message bot-message'>
                    <p className='initial-message'>Ask questions to receive answers based on the pdf or URL you provided in the previous page.</p>
                </div>
            }
            <div className='chat-messages'>
                {messages.map((message, index) => (
                    <ChatMessage key={index} message={message} />
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form className='chat-input' onSubmit={handleSendMessage}>
                <input
                    type='text'
                    placeholder='Type a question and press enter...'
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                />
            </form>
        </div>
    );
}

export default ChatInterface;