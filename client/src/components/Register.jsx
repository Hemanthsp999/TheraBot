import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    gender: "",
    age: "",
    phone_number: "",
    password: "",
    re_password: "",
    role: "user",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/register/",
        formData,
      );

      console.log("User Registration: ", response.data.message);

      if (!response.data.message) {
        setError(response.data.error || "Registration failed");
      } else {
        setSuccess("Registration successful! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (error) {
      setError("Something went wrong, please try again.", error);
    }
  };

  return (
    <div
      className="min-h-screen register flex items-center justify-center bg-gray-40 px-4"
      data-aos="flip-right"
    >
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">
            User Registration
          </h1>
          <p className="text-gray-600">
            Welcome to <b>TheraBot</b>, please register to explore the service
            of TheraBot
          </p>
        </div>

        <div className="bg-white text-nowrap rounded-2xl shadow-lg p-8 hover:shadow-2xl  duration-100 transform hover:scale-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative z-0 w-full mb-5 group">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                placeholder=" "
                required
              />

              <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:left-1/2 peer-placeholder-shown:-translate-x-1/2 peer-focus:scale-75 peer-focus:-translate-y-6 peer-focus:left-1/2 peer-focus:-translate-x-1/2 text-center">
                User Name
              </label>
            </div>

            <div className="relative z-0 w-full mb-5 group">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                placeholder=" "
                required
              />

              <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:left-1/2 peer-placeholder-shown:-translate-x-1/2 peer-focus:scale-75 peer-focus:-translate-y-6 peer-focus:left-1/2 peer-focus:-translate-x-1/2 text-center">
                Email
              </label>
            </div>

            <div className="relative z-0 w-full mb-2 group">
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="block w-full text-center py-3 px-3 text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 sm:text-sm"
                required
              >
                <option value="" disabled>
                  Select Gender
                </option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div className="relative z-0 w-full mb-5 group">
              <input
                type="tel"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                placeholder=" "
                required
              />

              <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:left-1/2 peer-placeholder-shown:-translate-x-1/2 peer-focus:scale-75 peer-focus:-translate-y-6 peer-focus:left-1/2 peer-focus:-translate-x-1/2 text-center">
                Age
              </label>
            </div>

            <div className="relative z-0 w-full mb-5 group">
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                placeholder=" "
                required
              />

              <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:left-1/2 peer-placeholder-shown:-translate-x-1/2 peer-focus:scale-75 peer-focus:-translate-y-6 peer-focus:left-1/2 peer-focus:-translate-x-1/2 text-center">
                Phone Number
              </label>
            </div>

            <div className="relative z-0 w-full mb-5 group">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                placeholder=" "
                required
              />

              <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:left-1/2 peer-placeholder-shown:-translate-x-1/2 peer-focus:scale-75 peer-focus:-translate-y-6 peer-focus:left-1/2 peer-focus:-translate-x-1/2 text-center">
                Password
              </label>
            </div>
            <div className="relative z-0 w-full mb-5 group">
              <input
                type="password"
                name="re_password"
                value={formData.re_password}
                onChange={handleChange}
                className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                placeholder=" "
                required
              />

              <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:left-1/2 peer-placeholder-shown:-translate-x-1/2 peer-focus:scale-75 peer-focus:-translate-y-6 peer-focus:left-1/2 peer-focus:-translate-x-1/2 text-center">
                Re-Enter Password
              </label>
            </div>
            {error && <p className="text-red-500">{error}</p>}
            {success && <p className="text-green-500">{success}</p>}
            <div className="flex flex-col">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 rounded"
              >
                Register
              </button>
              <p className="text-gray-900 py-2">
                Already have an account?{" "}
                <Link to="/login">
                  <u>Login here</u>
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
