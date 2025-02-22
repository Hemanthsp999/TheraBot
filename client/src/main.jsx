import React from "react";
import ReactDOM from "react-dom/client";
import "./components/css/index.css";
import App from "./App";
import Login from "./components/Login";
import Register from "./components/Register.jsx";
import Forgetpassword from "./components/ForgetPassword.jsx";
import Landingpage from "./components/Landingpage";
import ChatBot from "./components/ChatBot.jsx";
import About from "./components/About";
import Contact from "./components/Contact";
import Therapist from "./components/Therapist";
//import LoginSelection from './components/LoginSelection';
import Protected from "./components/ProtectedRoute.jsx";
import AccessAccount from "./components/AccessAccount";
import TherapistLogin from "./components/TherapistLogin";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Landingpage /> },
      { path: "/access-account", element: <AccessAccount /> },
      { path: "/login", element: <Login /> },
      { path: "/therapist-login", element: <TherapistLogin /> },
      { path: "/signup", element: <Register /> },
      { path: "/about", element: <About /> },
      { path: "/contact", element: <Contact /> },
      { path: "/therapist", element: <Therapist /> },
      { path: "/forget", element: <Forgetpassword /> },
    ],
  },
  // Separate route for ChatBot without App wrapper
  {
        // Add Protected Route
    path: "/chatbot",
    element: <Protected />,
    children: [{ index: true, element: <ChatBot /> }],
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
