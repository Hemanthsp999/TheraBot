import Bot from './images/Bot.jpeg';
import { Link } from 'react-router-dom';
import { Typography } from "@material-tailwind/react";

export default function Footer() {
    return (
        <footer className="w-full bg-slate-900 text-slate-400 py-10 px-4 border-t border-slate-800 mt-auto">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
                
                {/* Branding Core Container */}
                <div className="flex items-center space-x-3">
                    <img src={Bot} alt="TheraBot Logo" className="w-9 h-9 rounded-xl object-cover" />
                    <Typography as="span" className="text-lg font-bold tracking-tight text-white">
                        TheraBot
                    </Typography>
                </div>

                {/* Directory Navigation Blocks */}
                <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-medium">
                    {["About Us", "License", "Contribute", "Contact Us"].map((item, index) => (
                        <li key={index}>
                            <Link to={`/${item.toLowerCase().replace(/\s+/g, '')}`} className="hover:text-indigo-400 transition-colors">
                                {item}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="max-w-7xl mx-auto border-t border-slate-800 my-6" />

            {/* Subfooter Metadata Grid Layout */}
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                <p>&copy; {new Date().getFullYear()} TheraBot. All rights reserved.</p>
                <p className="flex items-center gap-1.5 font-medium text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" /> 
                    Secure End-to-End Encrypted Data Nodes
                </p>
            </div>
        </footer>
    );
}
