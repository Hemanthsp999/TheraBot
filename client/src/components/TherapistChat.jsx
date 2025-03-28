import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axios from "axios";

const TherapistChat = () => {
  const [activeClient, setActiveClient] = useState(null);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef(null);

  // Sample client data (would come from API in a real implementation)
  //
  /*
  useEffect(() => {
    const access_token = localStorage.getItem("accessToken");
    const id = localStorage.getItem("therapist_id");
    const api = "http://127.0.0.1:8000/api/fetchClients/";

    const get_clients = async () => {
      try {
        const response = await axios.get(api, {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },

          params: { therapist_id: id },
        });

        console.log(response.data.message);
      } catch (e) {
        console.error("Error: ", e.response?.message);
      }
    };
    get_clients();
  }, []);
  */
  const [clients, setClients] = useState([
    {
      id: 1,
      name: "John Doe",
      lastMessage: "I've been feeling better this week",
      lastMessageTime: "10:30 AM",
      unread: 2,
      status: "online",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      messages: [
        {
          id: 1,
          text: "Hello Dr. Smith, I wanted to discuss my progress",
          sender: "client",
          time: "10:15 AM",
        },
        {
          id: 2,
          text: "Of course, John. How have you been feeling since our last session?",
          sender: "therapist",
          time: "10:20 AM",
        },
        {
          id: 3,
          text: "I've been feeling better this week",
          sender: "client",
          time: "10:30 AM",
        },
      ],
    },
    {
      id: 2,
      name: "Jane Smith",
      lastMessage: "Thank you for the resources",
      lastMessageTime: "Yesterday",
      unread: 0,
      status: "offline",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      messages: [
        {
          id: 1,
          text: "I reviewed the mindfulness exercises you recommended",
          sender: "client",
          time: "Yesterday, 3:45 PM",
        },
        {
          id: 2,
          text: "That's great! Which ones did you find most helpful?",
          sender: "therapist",
          time: "Yesterday, 4:00 PM",
        },
        {
          id: 3,
          text: "Thank you for the resources",
          sender: "client",
          time: "Yesterday, 4:15 PM",
        },
      ],
    },
    {
      id: 3,
      name: "Michael Johnson",
      lastMessage: "Can we reschedule our next appointment?",
      lastMessageTime: "Monday",
      unread: 1,
      status: "away",
      avatar: "https://randomuser.me/api/portraits/men/67.jpg",
      messages: [
        {
          id: 1,
          text: "Can we reschedule our next appointment?",
          sender: "client",
          time: "Monday, 2:30 PM",
        },
      ],
    },
    {
      id: 4,
      name: "Emily Davis",
      lastMessage: "I'll try the techniques we discussed",
      lastMessageTime: "Oct 15",
      unread: 0,
      status: "online",
      avatar: "https://randomuser.me/api/portraits/women/33.jpg",
      messages: [
        {
          id: 1,
          text: "How are you feeling after our session yesterday?",
          sender: "therapist",
          time: "Oct 14, 10:00 AM",
        },
        {
          id: 2,
          text: "Much better, thank you for asking",
          sender: "client",
          time: "Oct 14, 11:30 AM",
        },
        {
          id: 3,
          text: "Remember to practice the breathing exercises we discussed",
          sender: "therapist",
          time: "Oct 14, 11:45 AM",
        },
        {
          id: 4,
          text: "I'll try the techniques we discussed",
          sender: "client",
          time: "Oct 15, 9:00 AM",
        },
      ],
    },
  ]);

  // Filter clients based on search term
  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Scroll to bottom of messages when new message is added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeClient]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !activeClient) return;

    const newMessage = {
      id: activeClient.messages.length + 1,
      text: message,
      sender: "therapist",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const updatedClients = clients.map((client) => {
      if (client.id === activeClient.id) {
        return {
          ...client,
          messages: [...client.messages, newMessage],
          lastMessage: message,
          lastMessageTime: "Just now",
        };
      }
      return client;
    });

    setClients(updatedClients);
    setActiveClient({
      ...activeClient,
      messages: [...activeClient.messages, newMessage],
      lastMessage: message,
      lastMessageTime: "Just now",
    });
    setMessage("");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "offline":
        return "bg-gray-500";
      case "away":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="flex flex-col mt-10 min-h-screen">
      <div className="flex-grow flex bg-gray-100">
        {/* Sidebar - Client List */}
        <div className="w-full md:w-1/3 lg:w-1/2 bg-white border-r border-gray-300">
          <div className="p-4 border-b border-gray-300">
            <h2 className="text-xl font-semibold text-gray-800">Messages</h2>
            <div className="mt-2">
              <input
                type="text"
                placeholder="Search clients..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-y-auto h-[calc(100vh-13rem)]">
            {filteredClients.length > 0 ? (
              filteredClients.map((client) => (
                <div
                  key={client.id}
                  className={`p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer ${activeClient?.id === client.id ? "bg-blue-50" : ""}`}
                  onClick={() => setActiveClient(client)}
                >
                  <div className="flex items-center">
                    <div className="relative">
                      <img
                        src={client.avatar}
                        alt={client.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <span
                        className={`absolute bottom-0 right-0 w-3 h-3 ${getStatusColor(client.status)} rounded-full border-2 border-white`}
                      ></span>
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-medium text-gray-900">
                          {client.name}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {client.lastMessageTime}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {client.lastMessage}
                      </p>
                    </div>
                    {client.unread > 0 && (
                      <span className="ml-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {client.unread}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                No clients found
              </div>
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="hidden md:flex flex-col w-2/3 lg:w-3/4 bg-gray-50">
          {activeClient ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-300 bg-white flex items-center">
                <div className="relative">
                  <img
                    src={activeClient.avatar}
                    alt={activeClient.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 ${getStatusColor(activeClient.status)} rounded-full border-2 border-white`}
                  ></span>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">
                    {activeClient.name}
                  </h3>
                  <p className="text-sm text-gray-500 capitalize">
                    {activeClient.status}
                  </p>
                </div>
                <div className="ml-auto flex space-x-2">
                  <button className="p-2 rounded-full hover:bg-gray-100">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </button>
                  <button className="p-2 rounded-full hover:bg-gray-100">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                  <button className="p-2 rounded-full hover:bg-gray-100">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                  {activeClient.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === "therapist" ? "justify-end" : "justify-start"}`}
                    >
                      {msg.sender === "client" && (
                        <img
                          src={activeClient.avatar}
                          alt={activeClient.name}
                          className="w-8 h-8 rounded-full object-cover mr-2 self-end"
                        />
                      )}
                      <div
                        className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${
                          msg.sender === "therapist"
                            ? "bg-blue-500 text-white rounded-br-none"
                            : "bg-white text-gray-800 rounded-bl-none shadow"
                        }`}
                      >
                        <p>{msg.text}</p>
                        <p
                          className={`text-xs mt-1 ${msg.sender === "therapist" ? "text-blue-100" : "text-gray-500"}`}
                        >
                          {msg.time}
                        </p>
                      </div>
                      {msg.sender === "therapist" && (
                        <img
                          src="https://randomuser.me/api/portraits/women/28.jpg" // Therapist avatar
                          alt="Therapist"
                          className="w-8 h-8 rounded-full object-cover ml-2 self-end"
                        />
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-300 mb-30 bg-white">
                <form
                  onSubmit={handleSendMessage}
                  className="flex items-center"
                >
                  <button
                    type="button"
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                      />
                    </svg>
                  </button>
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 mx-3 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                    disabled={!message.trim()}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 mx-auto text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
                <h3 className="mt-2 text-xl font-medium text-gray-900">
                  Select a conversation
                </h3>
                <p className="mt-1 text-gray-500">
                  Choose a client from the list to start chatting
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Mobile view - when a chat is selected */}
        {activeClient && (
          <div className="fixed inset-0 bg-white z-50 md:hidden flex flex-col">
            <div className="p-4 border-b border-gray-300 flex items-center">
              <button
                className="mr-2 p-2 rounded-full hover:bg-gray-100"
                onClick={() => setActiveClient(null)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <div className="relative">
                <img
                  src={activeClient.avatar}
                  alt={activeClient.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span
                  className={`absolute bottom-0 right-0 w-3 h-3 ${getStatusColor(activeClient.status)} rounded-full border-2 border-white`}
                ></span>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">
                  {activeClient.name}
                </h3>
                <p className="text-sm text-gray-500 capitalize">
                  {activeClient.status}
                </p>
              </div>
              <div className="ml-auto">
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-4">
                {activeClient.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === "therapist" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.sender === "client" && (
                      <img
                        src={activeClient.avatar}
                        alt={activeClient.name}
                        className="w-8 h-8 rounded-full object-cover mr-2 self-end"
                      />
                    )}
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        msg.sender === "therapist"
                          ? "bg-blue-500 text-white rounded-br-none"
                          : "bg-white text-gray-800 rounded-bl-none shadow"
                      }`}
                    >
                      <p>{msg.text}</p>
                      <p
                        className={`text-xs mt-1 ${msg.sender === "therapist" ? "text-blue-100" : "text-gray-500"}`}
                      >
                        {msg.time}
                      </p>
                    </div>
                    {msg.sender === "therapist" && (
                      <img
                        src="https://randomuser.me/api/portraits/women/28.jpg" // Therapist avatar
                        alt="Therapist"
                        className="w-8 h-8 rounded-full object-cover ml-2 self-end"
                      />
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-300">
              <form onSubmit={handleSendMessage} className="flex items-center">
                <button
                  type="button"
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                    />
                  </svg>
                </button>
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 mx-3 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <button
                  type="submit"
                  className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                  disabled={!message.trim()}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default TherapistChat;
