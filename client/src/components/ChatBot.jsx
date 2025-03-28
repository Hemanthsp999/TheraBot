import { Link } from "react-router-dom";
import "./css/App.css";
import axios from "axios";
import { useState, useRef, useEffect } from "react";
import { Send, ArrowLeft, Volume2, AudioLines } from "lucide-react";
import Bot from "./images/Bot.jpeg";
import { useReactMediaRecorder } from "react-media-recorder";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AutoLogout from "./AutoLogout.jsx";
import Speech from "react-text-to-speech";

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
  const [storedAudio, setStoredAudio] = useState(null);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Audio handler
  const { status, startRecording, stopRecording, mediaBlobUrl } =
    useReactMediaRecorder({
      audio: true,
      video: false,
      onStop: async (blobUrl) => {
        console.log("Recording stopped. Blob URL:", blobUrl);

        // Convert mediaBlobUrl to an actual Blob object
        // Don't use await fetch(mediaBlobUrl) its not correct
        const response = await fetch(blobUrl);
        const audioBlob = await response.blob();
        console.log("Type ", audioBlob.type);
        const audioFile = new File([audioBlob], "recorded_audio.wav", {
          type: audioBlob.type /* this is not a correct way to check the type*/,
        });

        setRecordedAudio(blobUrl); // Store in state

        console.log(" Stored Audio:", audioFile);
        console.log(audioFile.type);
        handleSendMessage({ text: "", audio: audioFile });
      },
    });

  // True when user clicks and false if get clicked again
  const toggleButton = () => {
    if (status !== "recording") {
      console.log("Start recording...");

      toast.info("Recording started... Speak now!", {
        position: "top-right",
        autoClose: 2000, // Closes after 2 seconds
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });

      startRecording();
    } else {
      console.log("Stop recording...");

      toast.success(" Recording stopped! Processing audio...", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });

      stopRecording();
    }
  };

  const requestMicPermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log(" Microphone access granted.");
    } catch (error) {
      console.error(" Microphone access denied:", error);
      alert("Please allow microphone access for recording to work.");
    }
  };

  useEffect(() => {
    navigator.permissions.query({ name: "microphone" }).then((permission) => {
      if (permission.state === "denied") {
        requestMicPermission();
      }
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async ({ text = "", audio = null }) => {
    if (((text || "").trim() === "" && !audio) || isLoading) return;

    const userMessage = text.trim();
    setInputMessage("");
    setIsLoading(true);

    const API_URL = "http://127.0.0.1:8000/api/chatbot/";

    setMessages((prev) => [...prev, { type: "user", content: userMessage }]);

    try {
      const access_token = localStorage.getItem("accessToken");
      console.log("Access: ", localStorage.getItem("accessToken"));
      if (!access_token) {
        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            content: "Authentication error. Please log in again.",
          },
        ]);
        setIsLoading(false);
        return;
      }

      const formData = new FormData();
      if (text) {
        formData.append("query", text);
      }
      if (audio) {
        console.log("Audio File: ", audio);
        formData.append("audio", audio);
      }
      console.log("Form Data: ", formData);

      const response = await axios.post(API_URL, formData, {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      const botResponse =
        (await response.data.response) || "Sorry, I couldn't understand that.";

      setStoredAudio(response.data.response);

      let currentMessage = "";
      setMessages((prev) => [...prev, { type: "bot", content: "" }]); // Add empty message slot

      botResponse.split("").forEach((char, index) => {
        setTimeout(() => {
          currentMessage += char;
          setMessages((prev) => {
            const updatedMessages = [...prev];
            updatedMessages[updatedMessages.length - 1] = {
              type: "bot",
              content: currentMessage,
            };
            return updatedMessages;
          });
        }, index * 50); // Adjust typing speed (50ms per character)
      });
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);

      if (error.response?.status > 399 || error.response?.status < 500) {
        setMessages((prev) => [
          ...prev,
          { type: "bot", content: "Session expired. Please log in again." },
        ]);
      }
    }

    setRecordedAudio(null);
    setIsLoading(false);
  };

  const handleSendTextMessage = (e) => {
    e.preventDefault();
    handleSendMessage({ text: inputMessage });
  };

  return (
    <>
      <main className="flex-1">
        <AutoLogout />
      </main>
      <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-100 rounded-2xl">
        <ToastContainer />
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
              <h1 className="text-xl font-semibold text-purple-600">
                TheraBot
              </h1>
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
              className={`flex flex-col ${message.type === "user" ? "items-end" : "items-start"}`}
            >
              {/* Bot/User Message Container */}
              <div
                className={`max-w-[70%] p-3 rounded-2xl text-white mt-2 break-words ${
                  message.type === "user"
                    ? "bg-purple-500 text-sm rounded-br-none"
                    : "bg-blue-400 rounded-bl-none text-sm"
                }`}
              >
                {message.content}
              </div>

              {/* Volume Button (Only for Bot Messages) */}
              {message.type === "bot" && (
                <button
                  className="mt-1 flex items-center text-white hover:text-gray-400"
                  onClick={(e) => {
                    e.preventDefault;
                  }}
                >
                  {/*<Volume2 size={20} />*/}
                  <Speech text={storedAudio} />
                </button>
              )}
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
        <form className="border-t p-4 bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message here..."
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:border-purple-500 text-black"
              //disabled={isLoading}
            />
            <button
              type="button"
              className={`p-2 bg-teal-400 ${status === "recording" ? "hover:bg-red " : "hover:bg-teal-500 rounded-lg text-white"}`}
              onClick={(e) => {
                e.preventDefault();
                toggleButton();
              }}
            >
              <AudioLines size={30} />
            </button>

            {/* This is for testing purpose*/}
            {mediaBlobUrl && <audio src={mediaBlobUrl} controls />}

            <button
              type="submit"
              className={`p-2 rounded-lg transition-colors ${
                isLoading || !inputMessage.trim()
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-purple-500 hover:bg-purple-600 text-white"
              }`}
              onClick={handleSendTextMessage}
              disabled={isLoading || !inputMessage.trim()}
            >
              <Send size={20} />
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ChatBot;
