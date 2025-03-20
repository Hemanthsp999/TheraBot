import axios from "axios";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const TherapistLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    licenseNumber: "", // Additional field for therapists
    user_type: "therapist",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const api = "http://127.0.0.1:8000/api/login/";
      console.log("Sending Request Data:", formData); // ✅ Log request data

      const response = await axios.post(api, formData);
      console.log("Response", response.data);

      alert("Therapist logged in");

      localStorage.setItem("accessToken", response.data.access_token);
      localStorage.setItem("refreshToken", response.data.refresh_token);
      localStorage.setItem("name", response.data.name);
      localStorage.setItem("expiresAt", response.data.expires_at);
      localStorage.setItem("user_type", response.data.user_type);
      localStorage.setItem("therapist_id", response.data.therapist_id);

      console.log(localStorage.getItem("accessToken"));
      console.log(localStorage.getItem("refreshToken"));
      console.log(localStorage.getItem("therapist_id"));

      navigate(response.data.redirect_url);
    } catch (err) {
      console.error("Login Failed:", err.response?.data || err.message); // ✅ Log backend error
      setError("Login failed. Please check your credentials.");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-40 px-4"
      data-aos="flip-down"
    >
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">
            Therapist Login
          </h1>
          <p className="text-gray-600">
            Welcome back, please login to your professional account
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl  duration-100 transform hover:scale-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative z-0 w-full mb-5 group">
              <input
                type="email"
                name="email"
                value={formData.therapist_email}
                onChange={handleChange}
                className="text-center block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                placeholder=" "
                required
              />
              <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:left-1/2 peer-placeholder-shown:-translate-x-1/2 peer-focus:scale-75 peer-focus:-translate-y-6 peer-focus:left-1/2 peer-focus:-translate-x-1/2 text-center">
                Therapist Email
              </label>
            </div>
            <div className="relative z-0 w-full mb-5 group">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="block text-center py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                placeholder=" "
                required
              />

              <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:left-1/2 peer-placeholder-shown:-translate-x-1/2 peer-focus:scale-75 peer-focus:-translate-y-6 peer-focus:left-1/2 peer-focus:-translate-x-1/2 text-center">
                Password
              </label>
            </div>

            {error && <div className="text-red-500 text-center">{error}</div>}

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors duration-300"
            >
              Login
            </button>

            <div className="text-center text-gray-600">
              <p>
                Don't have an account?{" "}
                <Link to="/register" className="text-green-600 hover:underline">
                  Create one
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TherapistLogin;
