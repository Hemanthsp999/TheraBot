import { useState, useEffect, useRef } from "react";
import Footer from "../components/Footer";
import User from "../components/images/user.png";
import axios from "axios";
import AutoLogout from "./AutoLogout.jsx";
import { toast, ToastContainer } from "react-toastify";

// Add WebSocket connection setup
const useWebSocket = (sessionId, accessToken, onMessageReceived) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef(null);

  useEffect(() => {
    if (!sessionId || !accessToken) return;

    // Create WebSocket connection
    const ws = new WebSocket(
      `ws://127.0.0.1:8000/ws/chat/${sessionId}/?token=${accessToken}`,
    );

    ws.onopen = () => {
      console.log("WebSocket connection established");
      setIsConnected(true);
      // Clear any reconnection timeout if connection is successful
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("WebSocket message received:", data);
      //setMessage((prevMessages) => [...prevMessages, data]);
      onMessageReceived(data);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = (event) => {
      console.log("WebSocket connection closed:", event);
      setIsConnected(false);

      // Attempt to reconnect after 5 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log("Attempting to reconnect WebSocket...");
        // The component will re-render and useEffect will run again
        setSocket(null);
      }, 5000);
    };

    setSocket(ws);

    // Clean up function
    return () => {
      if (ws) {
        ws.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [sessionId, accessToken]);

  // Function to send message via WebSocket
  const sendMessage = (message) => {
    if (socket && isConnected) {
      socket.send(JSON.stringify(message));
      return true;
    }
    return false;
  };

  return { sendMessage, isConnected };
};

// Component for displaying a single client in the sidebar
const ClientListItem = ({ client, isActive, onClick }) => {
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
    <div
      className={`p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer ${
        isActive ? "bg-blue-50" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex items-center">
        <div className="relative">
          <img
            src={User}
            alt={client.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          <span
            className={`absolute bottom-0 right-0 w-3 h-3 ${getStatusColor(
              client.status,
            )} rounded-full border-2 border-white`}
          ></span>
        </div>
        <div className="ml-3 flex-1">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-900">{client.name}</h3>
            <span className="text-xs text-gray-500">
              {client.lastMessageTime || "New"}
            </span>
          </div>
          <p className="text-sm text-gray-500 truncate">
            {client.last_message || "No messages yet"}
          </p>
        </div>
        {client.unread > 0 && (
          <span className="ml-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {client.unread}
          </span>
        )}
      </div>
    </div>
  );
};

// Updated ChatHeader component
const ChatHeader = ({ client }) => {
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

  // updated message header
  return (
    <div className="p-3 bg-green-600 text-white flex items-center shadow-md">
      <IconButton icon={<BackIcon />} className="md:hidden text-white" />
      <div className="relative">
        <img
          src={User}
          alt={client.name}
          className="w-10 h-10 rounded-full object-cover border-2 border-white"
        />
        <span
          className={`absolute bottom-0 right-0 w-3 h-3 ${getStatusColor(
            client.status,
          )} rounded-full border-2 border-white`}
        ></span>
      </div>
      <div className="ml-3 flex-1">
        <h3 className="text-lg font-medium">{client.name}</h3>
        <p className="text-xs opacity-80 capitalize">
          {client.status === "online"
            ? "online"
            : client.status === "away"
              ? "away"
              : "last seen recently"}
        </p>
      </div>
      <div className="flex space-x-1">
        <IconButton icon={<PhoneIcon />} className="text-white" />
        <IconButton icon={<VideoIcon />} className="text-white" />
        <IconButton icon={<MoreIcon />} className="text-white" />
      </div>
    </div>
  );
};

// Icon button component
// Updated IconButton component
const IconButton = ({ icon, onClick, className = "" }) => (
  <button
    className={`p-2 rounded-full hover:bg-opacity-20 hover:bg-black ${className}`}
    onClick={onClick}
  >
    {icon}
  </button>
);

// Updated icons for WhatsApp style
const PhoneIcon = () => (
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
      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
    />
  </svg>
);
const VideoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-white"
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
);

const MoreIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-white"
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
);

const BackIcon = () => (
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
);

const SendIcon = () => (
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
);

const AttachmentIcon = () => (
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
);

// Loading message component
const LoadingMessages = () => (
  <div className="flex-1 p-4 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-4 mx-auto"></div>
      <p className="text-gray-600">Loading conversation...</p>
    </div>
  </div>
);

// Updated UserMessageBubble - WhatsApp style
const UserMessageBubble = ({ message, time }) => (
  <div className="flex justify-start mb-3">
    <div className="flex items-end">
      <img
        src={User}
        alt="Client"
        className="w-8 h-8 rounded-full object-cover mr-2 self-end mb-1"
      />
      <div className="max-w-xs md:max-w-md lg:max-w-lg px-3 py-2 bg-white rounded-lg rounded-bl-none shadow text-gray-800 relative">
        <p className="pr-12">{message}</p>
        {time && (
          <span className="text-xs text-gray-500 absolute bottom-1 right-2">
            {time}
          </span>
        )}
        {/* Tail for user message */}
        <div className="absolute left-[-8px] bottom-0 w-3 h-3 overflow-hidden">
          <div className="absolute transform rotate-45 bg-white w-4 h-4 -bottom-2 -right-2"></div>
        </div>
      </div>
    </div>
  </div>
);

// Updated TherapistMessageBubble - WhatsApp style
const TherapistMessageBubble = ({ message, time }) => (
  <div className="flex justify-end mb-3">
    <div className="max-w-xs md:max-w-md lg:max-w-lg px-3 py-2 bg-green-100 rounded-lg rounded-br-none text-gray-800 relative">
      <p className="pr-12">{message}</p>
      {time && (
        <span className="text-xs text-gray-500 absolute bottom-1 right-2 flex items-center">
          {time}
          {/* WhatsApp double check */}
          <svg
            className="w-3 h-3 ml-1 text-blue-500"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M18 7l-8 8-4-4 1.5-1.5L10 12l6.5-6.5L18 7z" />
            <path d="M12 7l-8 8-4-4 1.5-1.5L4 13l6.5-6.5L12 7z" />
          </svg>
        </span>
      )}
      {/* Tail for therapist message */}
      <div className="absolute right-[-8px] bottom-0 w-3 h-3 overflow-hidden">
        <div className="absolute transform rotate-45 bg-green-100 w-4 h-4 -bottom-2 -left-2"></div>
      </div>
    </div>
  </div>
);

// Updated ChatMessages component
const ChatMessages = ({ chatData, loading, messagesEndRef }) => {
  // Get the current user type
  const currentUserType = localStorage.getItem("user_type");

  if (loading) {
    return <LoadingMessages />;
  }

  // Check if chatData is empty
  if (!chatData || chatData.length === 0) {
    return (
      <div className="flex-1 p-4 overflow-y-auto bg-gray-100">
        <div className="flex justify-center items-center h-full">
          <div className="text-center">
            <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-700">
              Start a conversation
            </h3>
            <p className="text-gray-500 text-sm mt-2">No messages yet</p>
          </div>
        </div>
      </div>
    );
  }

  // Flatten nested messages
  const flattenedMessages = chatData.flat(Infinity);

  // Group messages by date
  const messagesByDate = flattenedMessages.reduce((groups, msg) => {
    // Display the msg at what date they sent
    const date = msg.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(msg);
    return groups;
  }, {});

  return (
    <div className="flex-1 p-4 overflow-y-auto bg-gray-100">
      <div className="space-y-6">
        {Object.keys(messagesByDate).map((date) => (
          <div key={date}>
            <div className="flex justify-center mb-4">
              <div className="bg-white px-3 py-1 rounded-full text-xs text-gray-500 shadow-sm">
                {date}
              </div>
            </div>
            <div className="space-y-1">
              {messagesByDate[date].map((msg, index) => {
                // Determine if the message is from the current user
                const isCurrentUser =
                  (currentUserType === "therapist" &&
                    msg.sender === "therapist") ||
                  (currentUserType === "user" && msg.sender === "user");

                const messageContent = msg.text || msg.message || "";
                const displayTime = msg.time;

                // Use the appropriate message bubble based on who sent the message
                return isCurrentUser ? (
                  <CurrentUserMessageBubble
                    key={`msg-${msg.date}-${index}`}
                    message={messageContent}
                    time={displayTime}
                  />
                ) : (
                  <OtherUserMessageBubble
                    key={`msg-${msg.date}-${index}`}
                    message={messageContent}
                    time={displayTime}
                    sender={msg.sender}
                  />
                );
              })}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

// Message bubble for the current logged in user (shown on the right)
const CurrentUserMessageBubble = ({ message, time }) => (
  <div className="flex justify-end mb-3">
    <div className="max-w-xs text-nowrap md:max-w-md lg:max-w-lg px-3 py-2 bg-green-100 rounded-lg rounded-br-none text-gray-800 relative">
      {/*add mb-2 to adjust overlap of the message with time*/}
      <p className="pr-12 mb-2">{message}</p>
      {time && (
        <span className="text-xs text-gray-500 absolute bottom-1 right-2 flex items-center">
          {time}
          {/* WhatsApp double check */}
          <svg
            className="w-3 h-3 ml-1 text-blue-500"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M18 7l-8 8-4-4 1.5-1.5L10 12l6.5-6.5L18 7z" />
            <path d="M12 7l-8 8-4-4 1.5-1.5L4 13l6.5-6.5L12 7z" />
          </svg>
        </span>
      )}
      {/* Tail for current user message */}
      <div className="absolute right-[-8px] bottom-0 w-3 h-3 overflow-hidden">
        <div className="absolute transform rotate-45 bg-green-100 w-4 h-4 -bottom-2 -left-2"></div>
      </div>
    </div>
  </div>
);

// Message bubble for the other user (shown on the left)
const OtherUserMessageBubble = ({ message, time, sender }) => (
  <div className="flex justify-start mb-3">
    <div className="flex items-end">
      <img
        src={User}
        alt={sender === "user" ? "Client" : "Therapist"}
        className="w-8 h-8 rounded-full object-cover mr-2 self-end mb-1"
      />
      <div className="max-w-xs md:max-w-md lg:max-w-lg px-3 py-2 bg-white rounded-lg rounded-bl-none shadow text-gray-800 relative">
        <p className="pr-12 mb-2">{message}</p>
        {time && (
          <span className="text-xs text-gray-500 absolute bottom-1 right-2">
            {time}
          </span>
        )}
        {/* Tail for other user message */}
        <div className="absolute left-[-8px] bottom-0 w-3 h-3 overflow-hidden">
          <div className="absolute transform rotate-45 bg-white w-4 h-4 -bottom-2 -right-2"></div>
        </div>
      </div>
    </div>
  </div>
);

// MessageInput component
// Updated MessageInput component for WhatsApp style
const MessageInput = ({ message, setMessage, handleSendMessage, disabled }) => (
  <div className="p-3 bg-gray-50 border-t border-gray-200">
    <form onSubmit={handleSendMessage} className="flex items-center mb-30">
      {/* Emoji button */}
      <button
        type="button"
        className="p-2 text-white rounded-full hover:bg-gray-200 focus:outline-none"
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
            d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>

      {/* Attachment button */}
      <button
        type="button"
        className="p-2 text-white rounded-full hover:bg-gray-200 focus:outline-none"
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

      {/* Input field */}
      <input
        type="text"
        placeholder="Type a message..."
        className="flex-1 mx-2 p-3 rounded-full border border-gray-300 focus:outline-none focus:ring-1 focus:ring-green-500 text-black"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={disabled}
      />

      {/* Send button */}
      <button
        type="submit"
        className={`p-2 rounded-full focus:outline-none ${message.trim() && !disabled ? "bg-green-500 text-white" : "bg-gray-300 text-gray-500"}`}
        disabled={!message.trim() || disabled}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 12h14M12 5l7 7-7 7"
          />
        </svg>
      </button>
    </form>
  </div>
);

// EmptyState component
const EmptyState = () => (
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
);

// Main TherapistChat component
const TherapistChat = () => {
  const [activeClient, setActiveClient] = useState(null);
  const [chatData, setChatData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [clients, setClients] = useState([]);
  const messagesEndRef = useRef(null);
  // get therapist_id or user_id
  const get_user_type = localStorage.getItem("user_type");
  const accessToken = localStorage.getItem("accessToken");

  const therapistId =
    get_user_type === "user"
      ? localStorage.getItem("user_id")
      : localStorage.getItem("therapist_id");

  // Add this function inside the TherapistChat component, before the return statement
  const handleClientSelection = (client) => {
    setActiveClient(client);
  };

  // Notifies if access token is expired
  useEffect(() => {
    if (!accessToken) {
      toast.warn("Session expired. Please login again", {
        position: "top-right",
        autoClose: 2000, // Closes after 2 seconds
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
  }, [accessToken]);

  // Handle receiving a message via WebSocket
  const handleMessageReceived = (data) => {
    if (data.message_type === "chat_message") {
      // Add the new message to the chat
      setChatData((prevChatData) => [
        ...prevChatData,
        {
          id: data.message_id || Date.now(),
          text: data.message,
          sender: data.sender,
          time: data.time,
          /*
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          */
        },
      ]);

      // Update the client list to show the last message if needed
      if (activeClient && data.session_id === activeClient.session_id) {
        const updatedClients = clients.map((client) =>
          client.session_id === data.session_id
            ? {
                ...client,
                last_message: data.message,
                lastMessageTime: "Just now",
                unread:
                  client.id !== activeClient.id ? (client.unread || 0) + 1 : 0,
              }
            : client,
        );
        setClients(updatedClients);
      }
    } else if (data.message_type === "status_update") {
      // Update client status (online/offline/away)
      const updatedClients = clients.map((client) =>
        client.session_id === data.session_id
          ? { ...client, status: data.status }
          : client,
      );
      setClients(updatedClients);
    }
  };

  // Set up WebSocket connection for the active chat
  const { sendMessage, isConnected } = useWebSocket(
    activeClient?.session_id,
    localStorage.getItem("accessToken"),
    handleMessageReceived,
  );

  // Fetch client list on component mount
  useEffect(() => {
    fetchClientList();

    // Set up a polling interval to refresh the client list periodically
    const intervalId = setInterval(fetchClientList, 60000); // Refresh every minute

    return () => clearInterval(intervalId);
  }, []);

  // Fetch client list function
  const fetchClientList = async () => {
    try {
      if (!accessToken || !therapistId) {
        console.error("Missing authentication data");
        //setSampleClientList();
        return;
      }
      const role = get_user_type === "user" ? "user" : "therapist";
      console.log("therapist Id", therapistId);
      console.log("User role passing  ", role);

      const response = await axios.get(
        "http://127.0.0.1:8000/api/get_session/",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            role: role,
            user_id: therapistId,
          },
        },
      );

      console.log("Retrieved session successfully: ", response.data.response);
      if (response.data && response.data.response) {
        // Process the client list
        const clientList = response.data.response.map((client) => ({
          ...client,
          status: client.status || "offline",
        }));
        setClients(clientList);
      }
    } catch (error) {
      console.error("Error fetching client list:", error);
    }
  };

  // Fetch chat messages when activeClient changes
  useEffect(() => {
    if (activeClient) {
      fetchChatMessages(activeClient.session_id || activeClient.id);

      // Reset unread count for this client
      const updatedClients = clients.map((client) =>
        client.id === activeClient.id ? { ...client, unread: 0 } : client,
      );
      setClients(updatedClients);
    }
  }, [activeClient]);

  // Fetch chat messages for a specific session
  const fetchChatMessages = async (sessionId) => {
    setLoading(true);
    setChatData([]);

    try {
      if (!accessToken) {
        console.error("Missing access token");
        setLoading(false);
        return;
      }

      const response = await axios.get(
        "http://127.0.0.1:8000/api/get_chat_messages/",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            session_id: sessionId,
            role: get_user_type,
            user_id: therapistId,
          },
        },
      );

      if (Array.isArray(response.data.response)) {
        console.log("Messages received:", response.data.response);
        setChatData(response.data.response);
      }
    } catch (error) {
      console.error("Error fetching chat messages:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("ChatData Log: ", chatData);
  }, [chatData]);

  // Auto-scroll to bottom of messages when chat data changes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatData]);

  var [date, setDate] = useState(new Date());
  useEffect(() => {
    var timer = setInterval(() => setDate(new Date()), 1000);
    return function cleanup() {
      clearInterval(timer);
    };
  });

  // Handle sending a new message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !activeClient || loading) return;

    const currentTime = date.toLocaleTimeString();
    const date_ = date.toLocaleDateString();

    // Create a new message object
    const newMessage = {
      id: Date.now(),
      text: message,
      sender: "therapist",
      time: currentTime,
    };

    // Add message to chat (optimistic update)
    setChatData((prevChatData) => [...prevChatData, newMessage]);
    setMessage("");

    // Try to send via WebSocket first (real-time)
    const sentViaWebSocket = sendMessage({
      message_type: "chat_message",
      session_id: activeClient.session_id || activeClient.id,
      message: message,
      // get the user_type
      sender: get_user_type,
      therapist_id: therapistId,
      date: date_,
      curr_time: currentTime,
    });

    // If WebSocket fails or is not connected, fall back to API
    if (!sentViaWebSocket) {
      try {
        // Send message via REST API
        await sendMessageToAPI(
          activeClient.session_id || activeClient.id,
          message,
        );
      } catch (error) {
        console.error("Failed to send message:", error);
        // You could show an error message to the user here
      }
    }

    // Update the client list to show the last message
    const updatedClients = clients.map((client) =>
      client.id === activeClient.id
        ? {
            ...client,
            last_message: message,
            lastMessageTime: "Just now",
          }
        : client,
    );

    setClients(updatedClients);
  };

  // Function to send message to API
  const sendMessageToAPI = async (sessionId, messageText) => {
    try {
      if (!accessToken) {
        console.error("Missing access token");
        return;
      }

      // Send message to API
      await axios.post(
        "http://127.0.0.1:8000/api/make_chat_to_db/",
        {
          therapist_message: messageText,
          therapist_id: therapistId,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            session_id: sessionId,
            role: "therapist",
          },
        },
      );

      console.log(
        "Message sent to API:",
        messageText,
        "Session ID:",
        sessionId,
      );
      return true;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  };

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="flex flex-col mt-10 min-h-screen">
      <ToastContainer />
      <div className="flex-grow flex bg-gray-100">
        {/* Sidebar - Client List */}
        <div className="w-full md:w-1/3 lg:w-1/2 bg-white border-r border-gray-300">
          <div className="p-4 border-b border-gray-300">
            <h2 className="text-xl font-semibold text-gray-800">Messages</h2>
            {!isConnected && activeClient && (
              <div className="text-xs text-yellow-600 mt-1">
                Reconnecting... Messages may be delayed
              </div>
            )}
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
                <ClientListItem
                  key={client.id}
                  client={client}
                  isActive={activeClient?.id === client.id}
                  onClick={() => handleClientSelection(client)}
                />
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                No clients found
              </div>
            )}
          </div>
        </div>
        {/* Main Chat Area (Desktop) */}
        <div className="hidden md:flex flex-col w-2/3 lg:w-3/4 bg-gray-50">
          {activeClient ? (
            <>
              <ChatHeader client={activeClient} />

              {/* Chat Messages */}
              <ChatMessages
                chatData={chatData}
                loading={loading}
                messagesEndRef={messagesEndRef}
              />

              {/* Message Input */}
              <MessageInput
                message={message}
                setMessage={setMessage}
                handleSendMessage={handleSendMessage}
                disabled={loading}
              />
            </>
          ) : (
            <EmptyState />
          )}
        </div>

        {/* Mobile view - when a chat is selected */}
        {activeClient && (
          <div className="fixed inset-0 bg-white z-50 md:hidden flex flex-col">
            <div className="p-4 border-b border-gray-300 flex items-center">
              <IconButton
                icon={<BackIcon />}
                onClick={() => setActiveClient(null)}
              />

              <div className="relative">
                <img
                  src={User}
                  alt={activeClient.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span
                  className={`absolute bottom-0 right-0 w-3 h-3 ${
                    activeClient.status === "online"
                      ? "bg-green-500"
                      : activeClient.status === "away"
                        ? "bg-yellow-500"
                        : "bg-gray-500"
                  } rounded-full border-2 border-white`}
                ></span>
              </div>

              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">
                  {activeClient.name}
                </h3>
                <p className="text-sm text-gray-500 capitalize">
                  {activeClient.status || "offline"}
                </p>
              </div>

              <div className="ml-auto">
                <IconButton icon={<MoreIcon />} />
              </div>
            </div>

            {/* Mobile Messages */}
            <ChatMessages
              chatData={chatData}
              loading={loading}
              messagesEndRef={messagesEndRef}
            />

            {/* Message Input for Mobile */}
            <MessageInput
              message={message}
              setMessage={setMessage}
              handleSendMessage={handleSendMessage}
              disabled={loading}
            />
          </div>
        )}
      </div>
      <main className="flex-1">
        <AutoLogout />
      </main>
      <Footer />
    </div>
  );
};

export default TherapistChat;
