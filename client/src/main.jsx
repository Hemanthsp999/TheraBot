import React from 'react';
import ReactDOM from 'react-dom/client';
import './components/css/index.css';
import App from './App';
import Login from './components/Login';
import Register from './components/Register.jsx';
import Landingpage from './components/Landingpage';
import ChatBot from './components/ChatBot.jsx';
import About from './components/About';
import Contact from './components/Contact';
import Therapist from './components/Therapist';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            { index: true, element: <Landingpage /> },
            { path: "/login", element: <Login /> },
            { path: "/signup", element: <Register /> },
            { path: "/about", element: <About /> },
            { path: "/contact", element: <Contact /> },
            { path: "/therapist", element: <Therapist /> }
        ]
    },
    // Separate route for ChatBot without App wrapper
    {
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