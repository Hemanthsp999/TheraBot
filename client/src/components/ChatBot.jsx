import { useState } from "react";

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { text: "Hello! How can I help you today?", sender: "bot" },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    
    const newMessages = [...messages, { text: input, sender: "user" }];
    setMessages(newMessages);
    setInput("");
    
    setTimeout(() => {
      setMessages([...newMessages, { text: "I'm here to help!", sender: "bot" }]);
    }, 1000);
  };

  return (
    <div className="flex flex-col w-full max-w-md h-[80vh] bg-gray-900 p-4 rounded-xl chatbot mx-auto mt-8">
      <h2 className="text-white text-center mt-4">Chatbot</h2>
      <div className="flex-1 overflow-y-auto p-4 bg-gray-800 shadow rounded-lg max-h-96">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-2 my-2 rounded-lg max-w-xs ${
              msg.sender === "user" ? "ml-auto bg-blue-500 text-gray-900" : "mr-auto bg-gray-500 text-white"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <div className="flex mt-2 w-full">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-2 border rounded-lg focus:outline-none"
        />
        <button
          onClick={sendMessage}
          className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Send
        </button>
      </div>
    </div>
  );
}

