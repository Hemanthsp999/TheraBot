import Bot from './images/Bot.jpeg';
import { Link } from 'react-router-dom';
import { Typography } from "@material-tailwind/react";

export default function Footer() {
    return (
        <footer className="w-full bg-gray-900 text-gray-400 py-8 px-4 border-t border-gray-800">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
                
                <div className="flex items-center space-x-3">
                    <img src={Bot} alt="TheraBot Logo" className="w-9 h-9 rounded-xl object-cover" />
                    <Typography as="span" className="text-lg font-bold text-white">
                        TheraBot
                    </Typography>
                </div>

                <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
                    {["About Us", "License", "Contribute", "Contact Us"].map((item, index) => (
                        <li key={index}>
                            <Link to={`/${item.toLowerCase().replace(/\s+/g, '')}`} className="hover:text-indigo-400 transition-colors">
                                {item}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="max-w-7xl mx-auto border-t border-gray-800 my-6" />

            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
                <p>&copy; {new Date().getFullYear()} TheraBot. All rights reserved.</p>
                <p>🔒 End-to-End Encrypted Data Nodes</p>
            </div>
        </footer>
    );
}
