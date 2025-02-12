import React from 'react';
import ReactDOM from 'react-dom/client';
import './components/css/index.css';
import App from './App';
import Login from './components/Login';
import Register from './components/Register.jsx';
import Landingpage from './components/Landingpage';
import ChatBot from './components/ChatBot.jsx';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            { index: true, element: <Landingpage /> },
            { path: "/login", element: <Login /> },
            { path: "/signup", element: <Register /> },
        ]
    },
    // Separate route for ChatBot without App wrapper
    {
        // You mentioned route without <App/> component, so the chatbot will not wrap up inside the footer and navbar
        path: "/chatbot",
        element: <ChatBot />
    }
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
);
