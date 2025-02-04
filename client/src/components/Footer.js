import { Link } from 'react-router-dom';
import Bot from './images/Bot.jpeg';
const Footer = () => {
    return (
        <>
            <footer className="left-0 w-full bg-white shadow-sm dark:bg-stone-900 m-0 font-mono">
                <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
                    <div className="sm:flex sm:items-center sm:justify-between">
                        <Link href="https://flowbite.com/" className="flex items-center mb-4 sm:mb-0 space-x-3 rtl:space-x-reverse">
                            <img src={Bot} className="h-10 rounded-full" alt="Flowbite Logo" />
                            <span className="self-center text-3xl font-semibold whitespace-nowrap dark:text-white">TheraBot</span>
                        </Link>
                        <ul className="flex flex-wrap items-center mb-6 text-xl font-medium text-gray-500 sm:mb-0 dark:text-gray-400">
                            <li>
                                <Link to="#" className="hover:underline me-4 md:me-6">About</Link>
                            </li>
                            <li>
                                <Link to="#" className="hover:underline me-4 md:me-6">Privacy Policy</Link>
                            </li>
                            <li>
                                <Link to="#" className="hover:underline me-4 md:me-6">Licensing</Link>
                            </li>
                            <li>
                                <Link to="#" className="hover:underline">Contact</Link>
                            </li>
                        </ul>
                    </div>
                    <hr className="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
                    <span className="block text-xl text-gray-500 sm:text-center dark:text-gray-400">
                        © 2025 <a href="https://flowbite.com/" className="hover:underline">Flowbite™</a>. All Rights Reserved.
                    </span>
                </div>
            </footer>
        </>
    );
}

export default Footer;

