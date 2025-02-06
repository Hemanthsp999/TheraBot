import { useState } from "react";
import { Link } from 'react-router-dom';
import Bot from './images/Bot.jpeg';
import User from './images/user.png';

const Navbar = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // This component is done
    return (
        <div className="relative font-mono text-lg w-full">
            <nav className="fixed top-0 left-0 right-0 w-full bg-white border-gray-200 dark:bg-stone-900">
                <div className="w-full px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between mx-auto py-3">
                    <Link href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
                        <img
                            src={Bot}
                            className="h-8 sm:h-10 rounded-full"
                            alt="TherBot Logo"
                        />
                        <span className="self-center text-black text-lg sm:text-xl font-semibold whitespace-nowrap dark:text-white">
                            TheraBot 
                        </span>
                    </Link>
                    <div className="flex items-center md:order-2">
                        {/* User Dropdown */}
                        <button
                            type="button"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600 me-2 md:me-0"
                        >
                            <span className="sr-only">Open user menu</span>
                            <img
                                className="bg-white w-8 h-8 sm:w-10 sm:h-10 rounded-full"
                                src={User}
                                alt=""
                            />
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute right-4 top-12 mt-2 w-48 bg-white dark:bg-gray-700 shadow-lg rounded-lg z-50">
                                <div className="px-4 py-3">
                                    <span className="block text-sm sm:text-lg text-gray-900 dark:text-white">
                                        Bonnie Green
                                    </span>
                                    <span className="block text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                        name@flowbite.com
                                    </span>
                                </div>
                                <ul className="py-2">
                                    <li>
                                        <Link
                                            to="#"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                                        >
                                            Dashboard
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="#"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                                        >
                                            Settings
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="#"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                                        >
                                            Earnings
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="#"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                                        >
                                            Sign out
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
                        >
                            <span className="sr-only">Open main menu</span>
                            <svg
                                className="w-5 h-5"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 17 14"
                            >
                                <path
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M1 1h15M1 7h15M1 13h15"
                                />
                            </svg>
                        </button>
                    </div>

                    {/* Navigation Links */}
                    <div
                        className={`${
                            isMobileMenuOpen ? "block" : "hidden"
                        } w-full md:flex md:w-auto md:order-1 mt-2 md:mt-0`}
                    >
                        <ul className="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-4 lg:space-x-8 md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
                            <li>
                                <Link
                                    to={'/'}
                                    className="block py-2 px-3 text-white bg-blue-700 rounded md:bg-transparent md:text-blue-700 md:p-0 md:dark:text-blue-500"
                                    aria-current="page"
                                >
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="#"
                                    className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500"
                                >
                                    About
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="#"
                                    className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500"
                                >
                                    Services
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="#"
                                    className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500"
                                >
                                    Therapist
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="#"
                                    className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500"
                                >
                                    Contact
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </div>
    );
};

export default Navbar;
