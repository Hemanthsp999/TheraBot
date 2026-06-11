import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Typography } from "@material-tailwind/react";
import User from "./images/user.png";
import Bot from "./images/Bot.jpeg";
import axios from "axios";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [user_type, setUserType] = useState("");
  
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const storeUser = localStorage.getItem("name");
    const store_user_type = localStorage.getItem("user_type");
    if (storeUser) setEmail(storeUser);
    if (store_user_type) setUserType(store_user_type);
  }, [location]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleLogout = async (e) => {
    e.preventDefault();
    const refresh_token = localStorage.getItem("refreshToken");
    const access_token = localStorage.getItem("accessToken");

    const clearAndRedirect = () => {
      localStorage.clear();
      setEmail("");
      setUserType("");
      navigate("/login");
    };

    if (!refresh_token || !access_token) {
      clearAndRedirect();
      return;
    }

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/logout/",
        { refreshToken: refresh_token },
        { headers: { Authorization: `Bearer ${access_token}`, "Content-Type": "application/json" } }
      );
      clearAndRedirect();
      if (response.data?.redirect_url) navigate(response.data.redirect_url);
    } catch (error) {
      clearAndRedirect();
    }
  };

  const navLinks = [
    { name: user_type === "therapist" ? "Dashboard" : "Home", path: user_type === "therapist" ? "/therapist" : "/" },
    { name: "About", path: "/about" },
    { name: "Chat", path: user_type === "therapist" ? "/therapist/chat" : "/chat" },
    ...(user_type === "user" ? [{ name: "Services", path: "/user/services" }] : []),
    { name: "Contact", path: "/contact" }
  ];

  return (
    <nav className="sticky top-0 left-0 w-full bg-gray-950 text-white z-50 border-b border-gray-900 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          <div className="flex items-center space-x-3">
            <Link to={user_type === "therapist" ? "/therapist" : "/"} className="flex items-center space-x-2">
              <img src={Bot} className="w-9 h-9 rounded-xl object-cover" alt="Logo" />
              <Typography as="span" className="text-lg font-bold text-white">TheraBot</Typography>
            </Link>
          </div>

          <div className="hidden md:flex items-center">
            <ul className="flex space-x-6 text-sm font-medium">
              {navLinks.map((link, index) => (
                <li key={index}>
                  <Link to={link.path} className={`transition-colors py-2 block ${location.pathname === link.path ? "text-indigo-400 font-semibold" : "text-gray-300 hover:text-indigo-400"}`}>
                    {link.name}
                  </Link>
                </li>
              ))}
              {user_type === "therapist" && (
                <li>
                  <Link to="/therapist/patients" className={`transition-colors py-2 block ${location.pathname === "/therapist/patients" ? "text-indigo-400 font-semibold" : "text-gray-300 hover:text-indigo-400"}`}>
                    Patients
                  </Link>
                </li>
              )}
            </ul>
          </div>

          <div className="hidden md:flex items-center">
            {email ? (
              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center space-x-2 focus:outline-none p-1 rounded-lg hover:bg-gray-900">
                  <img src={User} alt="Profile" className="w-8 h-8 rounded-full border border-gray-800" />
                  <span className="text-sm text-gray-300 max-w-[100px] truncate">{email}</span>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-xl shadow-xl border border-gray-100 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100 bg-gray-50 rounded-t-xl"><p className="text-xs text-gray-500 font-medium truncate">{email}</p></div>
                    <Link to={user_type === "user" ? "/user/profile" : "/therapist/profile"} className="block px-4 py-2 text-sm hover:bg-gray-100" onClick={() => setDropdownOpen(false)}>Profile Settings</Link>
                    <Link to="/user/clientrequest" className="block px-4 py-2 text-sm hover:bg-gray-100" onClick={() => setDropdownOpen(false)}>Request Handler</Link>
                    <button onClick={handleLogout} className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-semibold">Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/access-account" className="text-sm font-semibold bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition shadow-sm">Sign In</Link>
            )}
          </div>

          <div className="flex md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-400 hover:text-white text-2xl p-2 focus:outline-none">
              {isOpen ? "✕" : "☰"}
            </button>
          </div>

        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-gray-950 border-t border-gray-900 px-4 py-3 space-y-1">
          {navLinks.map((link, index) => (
            <Link key={index} to={link.path} onClick={() => setIsOpen(false)} className={`block px-3 py-2 rounded-lg text-base ${location.pathname === link.path ? "bg-indigo-600 text-white" : "text-gray-300 hover:bg-gray-900"}`}>
              {link.name}
            </Link>
          ))}
          {user_type === "therapist" && (
            <Link to="/therapist/patients" onClick={() => setIsOpen(false)} className={`block px-3 py-2 rounded-lg text-base ${location.pathname === "/therapist/patients" ? "bg-indigo-600 text-white" : "text-gray-300 hover:bg-gray-900"}`}>
              Patients
            </Link>
          )}
          <div className="border-t border-gray-800 mt-2 pt-2">
            {email ? (
              <>
                <Link to={user_type === "user" ? "/user/profile" : "/therapist/profile"} className="block px-3 py-2 text-sm text-gray-400 hover:text-white" onClick={() => setIsOpen(false)}>Profile Settings</Link>
                <Link to="/user/clientrequest" className="block px-3 py-2 text-sm text-gray-400 hover:text-white" onClick={() => setIsOpen(false)}>Request Handler</Link>
                <button onClick={(e) => { setIsOpen(false); handleLogout(e); }} className="w-full text-left block px-3 py-2 text-sm text-red-400 font-medium mt-1">Logout</button>
              </>
            ) : (
              <Link to="/access-account" className="block text-center bg-indigo-600 text-white py-2 rounded-xl font-medium" onClick={() => setIsOpen(false)}>Sign In</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
