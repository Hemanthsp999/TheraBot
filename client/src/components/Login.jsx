import axios from "axios";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "", role: "patient" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/login", formData);
      localStorage.setItem("user_type", response.data.user_type);
      localStorage.setItem("accessToken", response.data.access_token);
      localStorage.setItem("refreshToken", response.data.refresh);
      localStorage.setItem("userEmail", formData.email);
      localStorage.setItem("name", response.data.name);
      localStorage.setItem("user_id", response.data.id);
      localStorage.setItem("expiresAt", response.data.expires_at);
      localStorage.setItem("patient_history", response.data.patient_history);

      navigate(response.data.redirect_url);
    } catch (error) {
      setError(error.response?.data?.error || "Something went wrong, please try again.");
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">User Login</h1>
          <p className="text-sm text-gray-500">Welcome back, please login to your professional account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative border-b-2 border-gray-200 focus-within:border-indigo-600 transition-colors duration-200 py-1">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="block w-full text-base text-gray-900 bg-transparent appearance-none focus:outline-none placeholder-gray-400"
              placeholder="Email address"
              required
            />
          </div>

          <div className="relative border-b-2 border-gray-200 focus-within:border-indigo-600 transition-colors duration-200 py-1">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="block w-full text-base text-gray-900 bg-transparent appearance-none focus:outline-none placeholder-gray-400"
              placeholder="Password"
              required
            />
          </div>

          <div className="min-h-[24px] flex items-center">
            {error && <p className="text-xs font-semibold text-red-600 bg-red-50 px-3 py-1 rounded-md">{error}</p>}
          </div>

          <div className="space-y-4">
            <button
              type="submit"
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition duration-150"
            >
              Log In
            </button>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs pt-1">
              <p className="text-gray-600">Don't have an Account? <Link to="/user/signup" className="text-indigo-600 hover:underline font-bold">Register here</Link></p>
              <Link to="/forget" className="text-indigo-600 hover:underline font-medium">Forgot Password?</Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
