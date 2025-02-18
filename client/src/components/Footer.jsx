import Bot from './images/Bot.jpeg';
import { Link } from 'react-router-dom';
import { Typography } from "@material-tailwind/react";
import './css/App.css';
import { useRef } from "react";
import { Link } from 'react-router-dom';

/* Don't alter Footer: You mentioned route '/chatbot' which is not a children of <App/> component, so the footer and navbar will not affect ChatBot page*/

export default function Footer() {
    const topRef = useRef(null);

    // Scroll to the top of the page
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <footer className="footer w-full bg-gray-900 p-6 text-white">
            <div ref={topRef}></div> {/* Reference to the top of the page */}

            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center sm:justify-between gap-6 text-center w-full">

                {/* Logo & Name - Responsive */}
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                    <img
                        src={Bot}
                        alt="logo"
                        className="w-12 h-12 rounded-full"
                    />
                    <Typography
                        as="span"
                        className="text-lg sm:text-xl font-semibold cursor-pointer"
                        onClick={scrollToTop} // Click to scroll to the top
                    >
                        TheraBot
                    </Typography>
                </div>

                {/* Footer Links */}
                <ul className="flex flex-col sm:flex-row flex-wrap items-center gap-y-2 gap-x-6">
                    {["About Us", "License", "Contribute", "Contact Us"].map((item, index) => (
                        <li key={index}>
                            <Typography
                                as={Link}
                                to={`/${item.toLowerCase()}`}
                                color="blue-gray"
                                className="font-normal transition-colors hover:text-blue-500 focus:text-blue-500"
                            >
                                {item}
                            </Typography>
                        </li>
                    ))}
                </ul>
            </div>

            <hr className="my-4 border-gray-700" />

            {/* Copyright */}
            <Typography color="blue-gray" className="text-center font-normal">
                &copy; {new Date().getFullYear()} TheraBot 
            </Typography>
        </footer>
    );
}

