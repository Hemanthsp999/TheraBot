import Bot from './images/Bot.jpeg';
import { Link } from 'react-router-dom';
import { Typography } from "@material-tailwind/react";
import './css/App.css';
import { useRef } from "react";

export default function Footer() {
    const topRef = useRef(null);

    // Scroll to the top of the page
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <footer className="footer w-full bg-gray-900 p-6 text-white mt-auto border-t border-gray-800">
            <div ref={topRef}></div>

            <div className="container mx-auto flex flex-col sm:flex-row flex-wrap items-center justify-center sm:justify-between gap-6 text-center">
                {/* Logo & Name - Responsive */}
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                    <img
                        src={Bot}
                        alt="logo"
                        className="w-12 h-12 rounded-lg"
                    />
                    <Typography
                        as="span"
                        className="text-lg sm:text-xl font-semibold cursor-pointer"
                        onClick={scrollToTop}
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
                                to={`/${item.toLowerCase().replace(/\s+/g, '')}`}
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
            <div className="container mx-auto">
                <Typography color="blue-gray" className="text-center font-normal">
                    &copy; {new Date().getFullYear()} TheraBot
                </Typography>
            </div>
        </footer>
    );
}
