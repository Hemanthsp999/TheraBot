/* 
Copyright 2025 [Hemanth S P]

 Licensed under the Apache License, Version 2.0 (the "License");
 You may not use this file except in compliance with the License.
 You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.

*/

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
import Service from "./components/Service.jsx";
import Protected from "./components/ProtectedRoute.jsx";
import AccessAccount from "./components/AccessAccount";
import TherapistLogin from "./components/TherapistLogin";
import TherapistRegister from "./components/TherapistRegistration.jsx";
import TherapistLanding from "./components/TherapistLanding.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ProfileSettings from "./components/ProfileSettings.jsx";
import PatientsPage from "./components/PatientsPage";
import PatientDetailPage from "./components/PatientDetailPage";
import TherapistChat from "./components/TherapistChat";
import ManageRequest from "./components/ManageRequest.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Landingpage /> },
      { path: "access-account", element: <AccessAccount /> },
      { path: "login", element: <Login /> },
      { path: "therapist-login", element: <TherapistLogin /> },
      { path: "user/signup", element: <Register /> },
      { path: "about", element: <About /> },
      { path: "contact", element: <Contact /> },
      { path: "register", element: <TherapistRegister /> },
      { path: "forget", element: <Forgetpassword /> },

      // User protected routes
      {
        path: "user",
        element: <Protected />,
        children: [
          { path: "therapist", element: <Therapist /> },
          { path: "services", element: <Service /> },
          { path: "profile", element: <ProfileSettings /> },
        ],
      },

      // Therapist protected routes (nested)
      {
        path: "therapist",
        element: <Protected />,
        children: [
          { index: true, element: <TherapistLanding /> },
          { path: "profile", element: <ProfileSettings /> },
          { path: "chat", element: <TherapistChat /> },
          { path: "patients", element: <PatientsPage /> },
          { path: "patients/:id", element: <PatientDetailPage /> },
          { path: "manage-requests", element: <ManageRequest /> },
        ],
      },
    ],
  },

  // Absolute protected route for user chatbot
  {
    path: "user/chatbot",
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
