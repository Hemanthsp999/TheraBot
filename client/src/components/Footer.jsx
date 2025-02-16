import Bot from './images/Bot.jpeg';
import { Link } from 'react-router-dom';
import { Typography } from "@material-tailwind/react";
import './css/App.css';
import { useRef } from "react";

export default function Footer() {
    const topRef = useRef(null);
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <footer className="footer w-full bg-gray-900 py-3 px-4 text-white">
            <div ref={topRef}></div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 max-w-6xl mx-auto">
                {/* Logo & Name */}
                <div className="flex items-center gap-2">
                    <Link to={'/'}>
                        <img
                            src={Bot}
                            alt="logo"
                            className="w-8 h-8 rounded-full"
                        />
                    </Link>
                    <Typography
                        as="span"
                        className="text-base font-semibold cursor-pointer"
                        onClick={scrollToTop}
                    >
                        TheraBot
                    </Typography>
                </div>

                {/* Footer Links */}
                <ul className="flex flex-wrap items-center gap-4 text-sm">
                    {["About", "License", "Contact"].map((item, index) => (
                        <li key={index}>
                            <Typography
                                as={Link}
                                to={`/${item.toLowerCase()}`}
                                color="blue-gray"
                                className="font-normal hover:text-blue-500 focus:text-blue-500"
                            >
                                {item}
                            </Typography>
                        </li>
                    ))}
                </ul>

                {/* Copyright */}
                <Typography color="blue-gray" className="text-sm">
                    &copy; {new Date().getFullYear()} TheraBot
                </Typography>
            </div>
        </footer>
    );
}