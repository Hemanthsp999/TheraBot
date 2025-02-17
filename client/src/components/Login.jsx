import axios from 'axios';
import { useState } from "react";
import { useNavigate, Link } from 'react-router-dom';
import Bot from './images/Bot.jpeg';

const Login = () => {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e, type) => {
        e.preventDefault();
        setError("");

        try {
            const endpoint = type === 'therapist' 
                ? "http://127.0.0.1:8000/api/therapist/login/"
                : "http://127.0.0.1:8000/api/login/";
                
            const response = await axios.post(endpoint, formData);
            
            localStorage.setItem("accessToken", response.data.access_token);
            localStorage.setItem("refreshToken", response.data.refresh);
            localStorage.setItem("userEmail", formData.email);
            localStorage.setItem("userType", type);
            localStorage.setItem("expiresAt", response.data.expires_at);

            navigate(response.data.redirect_url);
        } catch (error) {
            setError(error.response?.data?.error || "Invalid credentials. Please try again.");
        }
    };

    const LoginCard = ({ type }) => (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden w-full max-w-md">
            {/* Card Header */}
            <div className="bg-blue-600 text-white text-center py-2 text-sm font-medium">
                {type === 'therapist' ? 'THERAPIST LOGIN' : 'USER LOGIN'}
            </div>

            {/* Card Content */}
            <div className="p-6">
                <h2 className="text-xl font-semibold text-black mb-6 text-center">
                    {type === 'therapist' ? 'Login as Therapist' : 'Login as User'}
                </h2>

                <form onSubmit={(e) => handleSubmit(e, type)} className="space-y-4">
                    <div>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Email"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black"
                            required
                        />
                    </div>

                    <div>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Password"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        Login
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-600">
                        {type === 'therapist' ? (
                            <>
                                Want to join as a therapist?{' '}
                                <Link to="/therapist/register" className="text-blue-600 hover:text-blue-700 font-medium">
                                    Apply here
                                </Link>
                            </>
                        ) : (
                            <>
                                Don't have an account?{' '}
                                <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
                                    Sign up
                                </Link>
                            </>
                        )}
                    </p>
                    <Link to="#" className="text-blue-600 hover:text-blue-700 text-sm mt-2 inline-block">
                        Forgot Password?
                    </Link>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 py-12 px-4">
            {/* Header */}
            <div className="text-center mb-8">
                <img src={Bot} alt="TheraBot Logo" className="w-16 h-16 mx-auto rounded-full mb-4" />
                <h1 className="text-2xl font-bold text-gray-800">Welcome to TheraBot</h1>
            </div>

            {error && (
                <div className="text-red-500 text-sm text-center mb-4">
                    {error}
                </div>
            )}

            {/* Login Cards Container */}
            <div className="flex flex-col md:flex-row gap-8 justify-center items-start max-w-6xl mx-auto">
                <LoginCard type="user" />
                <LoginCard type="therapist" />
            </div>

            {/* Bottom Text */}
            <div className="text-center mt-8 text-gray-600 max-w-md mx-auto">
                <p className="text-sm">
                    Join our community of users and therapists dedicated to making mental health support accessible to everyone.
                </p>
            </div>
        </div>
    );
};

export default Login;