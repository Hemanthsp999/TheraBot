import React, { useState, useRef, useEffect } from 'react';
import { Send, ArrowLeft } from 'lucide-react';

const ChatBot = () => {
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      content: "Hello! I'm TheraBot, your mental health assistant. How are you feeling today?"
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessageToBackend = async (message) => {
    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error:', error);
      return "I apologize, but I'm having trouble connecting to the server. Please try again later.";
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    // Add user message immediately
    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);

    // Get bot response
    const botResponse = await sendMessageToBackend(userMessage);

    // Add bot response
    setMessages(prev => [...prev, { type: 'bot', content: botResponse }]);
    setIsLoading(false);
  };

  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-white">
      {/* Chat Header */}
      <div className="bg-white border-b p-4 shadow-sm flex items-center justify-between">
        <button onClick={handleBack} className="text-gray-600 hover:text-gray-800 p-1 rounded-lg hover:bg-gray-100">
          <ArrowLeft size={24} />
        </button>
        <div className="flex items-center">
          <img src="client\src\components\images\Bot.jpeg" alt="Bot Logo" className="h-8 w-8 mr-2" />
          <div>
            <h1 className="text-xl font-semibold text-black">TheraBot</h1>
            <p className="text-sm text-gray-500">Your Mental Health Assistant</p>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-lg ${message.type === 'user'
                ? 'bg-blue-500 text-white rounded-br-none'
                : 'bg-gray-100 text-black rounded-bl-none'
                }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-black p-3 rounded-lg rounded-bl-none">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message here..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:border-blue-500 text-black"
            disabled={isLoading}
          />
          <button
            type="submit"
            className={`p-2 rounded-lg transition-colors ${isLoading || !inputMessage.trim()
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            disabled={isLoading || !inputMessage.trim()}
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatBot;
