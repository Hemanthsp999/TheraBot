import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const TherapistLogin = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    specialization: "",
    experience: "",
    desc: "", // Additional field for therapists
    re_password: "",
    phone_number: "",
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
    const api = "http://127.0.0.1:8000/api/register-therapist/";
    console.log(formData);

    try {
      const response = await axios.post(api, formData);
      console.log("response", response);
      navigate("/therapist-login");
    } catch (e) {
      console.error(e);
    }
    setError("");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-40 px-4"
      data-aos="flip-down"
    >
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">
            Therapist SignIn
          </h1>
          <p className="text-gray-600">
            Welcome back, please login to your professional account
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl  duration-100 transform hover:scale-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative z-0 w-full mb-5 group">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="text-center block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                placeholder=" "
                required
              />
              <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:left-1/2 peer-placeholder-shown:-translate-x-1/2 peer-focus:scale-75 peer-focus:-translate-y-6 peer-focus:left-1/2 peer-focus:-translate-x-1/2 text-center">
                Therapist Name
              </label>
            </div>

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

            <div className="relative z-0 w-full mb-3 mt-10 group">
              {/*
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Specialization
              </label>
                                    */}
              <select
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                className="block w-full py-2 px-3 text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 sm:text-sm"
                required
              >
                <option value="" disabled>
                  Select Specialization
                </option>
                <option value="Clinical Psychology">Clinical Psychology</option>
                <option value="Counseling Psychology">
                  Counseling Psychology
                </option>
                <option value="Psychotherapy">Psychotherapy</option>
                <option value="Cognitive Behavioral Therapy (CBT)">
                  Cognitive Behavioral Therapy (CBT)
                </option>
                <option value="Trauma and PTSD Therapy">
                  Trauma and PTSD Therapy
                </option>
                <option value="Mindfulness-Based Therapy & Stress Management">
                  Mindfulness-Based Therapy & Stress Management
                </option>
                <option value="Behavioral Therapy">Behavioral Therapy</option>
                <option value="Neuropsychology">Neuropsychology</option>
                <option value="Holistic & Integrative Therapy">
                  Holistic & Integrative Therapy
                </option>
                <option value="Psychopharmacology (Psychiatry)">
                  Psychopharmacology (Psychiatry)
                </option>
              </select>
            </div>

            <div className="relative z-0 w-full mb-5 group">
              <input
                type="text"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                className="text-center block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                placeholder=" "
                required
              />
              <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:left-1/2 peer-placeholder-shown:-translate-x-1/2 peer-focus:scale-75 peer-focus:-translate-y-6 peer-focus:left-1/2 peer-focus:-translate-x-1/2 text-center">
                Experience(Yrs)
              </label>
            </div>

            <div className="relative z-0 w-full mb-5 group">
              <input
                type="text"
                name="desc"
                value={formData.desc}
                onChange={handleChange}
                className="text-center block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                placeholder=" "
                required
              />
              <label className="peer-focus:font-medium text-nowrap absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:left-1/2 peer-placeholder-shown:-translate-x-1/2 peer-focus:scale-75 peer-focus:-translate-y-6 peer-focus:left-1/2 peer-focus:-translate-x-1/2 text-center">
                Introduce about your occupation
              </label>
            </div>

            <div className="relative z-0 w-full mb-5 group">
              <input
                type="text"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                className="text-center block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                placeholder=" "
                required
              />
              <label className="peer-focus:font-medium text-nowrap absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:left-1/2 peer-placeholder-shown:-translate-x-1/2 peer-focus:scale-75 peer-focus:-translate-y-6 peer-focus:left-1/2 peer-focus:-translate-x-1/2 text-center">
                Phone Number
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

            <div className="relative z-0 w-full mb-5 group">
              <input
                type="password"
                name="re_password"
                value={formData.re_password}
                onChange={handleChange}
                className="block text-center py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                placeholder=" "
                required
              />

              <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:left-1/2 peer-placeholder-shown:-translate-x-1/2 peer-focus:scale-75 peer-focus:-translate-y-6 peer-focus:left-1/2 peer-focus:-translate-x-1/2 text-center">
                Re-Enter Password
              </label>
            </div>

            {error && <div className="text-red-500 text-center">{error}</div>}

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors duration-300"
            >
              Register
            </button>

            <div className="text-center text-gray-600">
              <p>
                Already have an account?{" "}
                <Link
                  to="/therapist-login"
                  className="text-green-600 hover:underline"
                >
                  Login here
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
