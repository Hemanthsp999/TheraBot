import { useState } from "react";
import { Link } from "react-router-dom";

const TherapistLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    licenseNumber: "", // Additional field for therapists
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Here you would typically send the data to your backend
      console.log("Therapist login attempt:", formData);

      // Add your therapist login logic here
      // navigate('/therapist-dashboard'); // After successful login
    } catch (err) {
      setError("Login failed. Please check your credentials.", err);
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
                value={formData.email}
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
                Need help?{" "}
                <Link to="/contact" className="text-green-600 hover:underline">
                  Contact Support
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
