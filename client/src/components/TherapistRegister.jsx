import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Bot from './images/Bot.jpeg';

const TherapistRegister = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        specialization: "",
        experience: "",
        license: "",
        education: "",
        about: ""
    });
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await axios.post("http://127.0.0.1:8000/api/therapist/register/", formData);
            alert("Application submitted successfully! We'll review and get back to you soon.");
            navigate("/login");
        } catch (error) {
            setError(error.response?.data?.error || "Application submission failed. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 py-12 px-4">
            <div className="text-center mb-8">
                <img src={Bot} alt="TheraBot Logo" className="w-16 h-16 mx-auto rounded-full mb-4" />
                <h1 className="text-2xl font-bold text-gray-800">Therapist Application</h1>
            </div>

            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="bg-blue-600 text-white text-center py-2 text-sm font-medium">
                    THERAPIST APPLICATION
                </div>

                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-700 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 mb-2">Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 mb-2">Specialization</label>
                                <input
                                    type="text"
                                    name="specialization"
                                    value={formData.specialization}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 mb-2">Years of Experience</label>
                                <input
                                    type="number"
                                    name="experience"
                                    value={formData.experience}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 mb-2">License Number</label>
                                <input
                                    type="text"
                                    name="license"
                                    value={formData.license}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-700 mb-2">Education & Certifications</label>
                            <textarea
                                name="education"
                                value={formData.education}
                                onChange={handleChange}
                                rows="3"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black"
                                required
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-gray-700 mb-2">About Yourself</label>
                            <textarea
                                name="about"
                                value={formData.about}
                                onChange={handleChange}
                                rows="4"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black"
                                required
                            ></textarea>
                        </div>

                        {error && (
                            <div className="text-red-500 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            Submit Application
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            Already registered?{' '}
                            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                                Login here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TherapistRegister; 