import React from "react";
import ReactMarkDown from 'react-markdown';

// Component for chat bubbles in interface
const ChatMessage = ({message}) => {
    // GPT response is in markdown
    const content = message.isBot ? (
        <ReactMarkDown children={message.text} />
    ) : (
        message.text
    );

    // Change styling of bubble based on if from GPT or user
    return (
        <div className={`chat-message ${message.isBot ? 'bot-message' : 'user-message'}`}>
            {content}
        </div>
    );
};

export default ChatMessage;
