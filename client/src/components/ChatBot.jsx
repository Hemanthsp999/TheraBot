import { Link } from "react-router-dom";
import axios from "axios";
import { useState, useRef, useEffect } from "react";
import { Send, ArrowLeft, Mic } from "lucide-react";
import Bot from "./images/Bot.jpeg";

const ChatBot = () => {
  const [messages, setMessages] = useState([
    {
      type: "bot",
      content:
        "Hello! I'm TheraBot, your mental health assistant. How are you feeling today?",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    setIsLoading(true);

    const API_URL = "http://127.0.0.1:8000/api/chatbot/";
    //console.log(accessToken);

    /*
    if (!accessToken) {
      console.error("No access token found. User may need to log in.");
      setMessages((prev) => [
        ...prev,
        { type: "bot", content: "Authentication error. Please log in again." },
      ]);
      setIsLoading(false);
      return;
    }*/

    setMessages((prev) => [...prev, { type: "user", content: userMessage }]);

    try {
            const accessToken = localStorage.getItem('accessToken');
            console.log("Access: ", accessToken);
      const response = await axios.post(
        API_URL,
        { query: userMessage }, // Correct: Send only query in body
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`, // Ensure correct format
            "Content-Type": "application/json",
          },
        },
      );
      const botResponse =
        response.data.response || "Sorry, I couldn't understand that.";

      setMessages((prev) => [...prev, { type: "bot", content: botResponse }]);
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);

            /*
      if (error.response?.status === 401) {
        setMessages((prev) => [
          ...prev,
          { type: "bot", content: "Session expired. Please log in again." },
        ]);
        localStorage.removeItem("accessToken"); // Clear invalid token
      }
            */
    }

    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-100 rounded-2xl">
      <div className="bg-white border-b rounded-xl p-4 shadow-sm flex items-center justify-between">
        <button className="text-gray-500 hover:text-gray-700 p-1 rounded-lg">
          <Link to={"/"}>
            <ArrowLeft size={24} />
          </Link>
        </button>
        <div className="flex items-center">
          <img
            src={Bot}
            alt="Bot Logo"
            className="h-9 w-9 mr-3 mb-3 rounded-xl"
          />
          <div>
            <h1 className="text-xl font-semibold text-purple-600">TheraBot</h1>
            <p className="text-sm text-gray-500">
              Your Mental Health Assistant
            </p>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-2xl text-white ${
                message.type === "user"
                  ? "bg-purple-500 text-sm rounded-br-none"
                  : "bg-blue-400 rounded-bl-none text-sm"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-blue-400 text-white p-3 rounded-lg rounded-bl-none">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="border-t p-4 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message here..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:border-purple-500 text-black"
            disabled={isLoading}
          />
          <button className="p-2 bg-teal-400 hover:bg-teal-500 rounded-lg text-white">
            <Mic size={20} />
          </button>
          <button
            type="submit"
            className={`p-2 rounded-lg transition-colors ${
              isLoading || !inputMessage.trim()
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-purple-500 hover:bg-purple-600 text-white"
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
