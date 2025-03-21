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
    availability: "",
    age: "",
    gender: "",
    role: "therapist",
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
    const api = "http://127.0.0.1:8000/api/register/";
    console.log(formData);

    try {
      const response = await axios.post(api, formData);
      console.log("response", response.data.message);
      navigate(response.data.redirect_url);
    } catch (e) {
      console.error(e);
    }
    setError("");
  };

  return (
    <div
      className="relative overflow-y-hidden min-h-screen flex items-center justify-center px-4"
      data-aos="flip-down"
    >
      <div className="max-w-xl w-full">
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
            <div className="grid grid-cols-2 gap-4">
              {/* First two fields in one row */}
              <div className="relative z-0 w-full group">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="block py-2.5 px-2 w-full text-sm text-gray-900 border-b-2 border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-600"
                  placeholder="Therapist Name"
                  required
                />
              </div>

              <div className="relative z-0 w-full group">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="block py-2.5 px-2 w-full text-sm text-gray-900 border-b-2 border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-600"
                  placeholder="Therapist Email"
                  required
                />
              </div>
            </div>

            {/* Remaining fields in a 3-column grid */}
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="relative z-0 w-full group">
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
                  <option value="Clinical Psychology">
                    Clinical Psychology
                  </option>
                  <option value="Counseling Psychology">
                    Counseling Psychology
                  </option>
                  <option value="Psychotherapy">Psychotherapy</option>
                  <option value="CBT">
                    Cognitive Behavioral Therapy (CBT)
                  </option>
                  <option value="PTSD Therapy">Trauma and PTSD Therapy</option>
                  <option value="Mindfulness-Based Therapy">
                    Mindfulness-Based Therapy
                  </option>
                  <option value="Behavioral Therapy">Behavioral Therapy</option>
                  <option value="Neuropsychology">Neuropsychology</option>
                  <option value="Holistic Therapy">Holistic Therapy</option>
                </select>
              </div>

              <div className="relative z-0 w-full group">
                <input
                  type="text"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  className="block py-2.5 px-2 w-full text-sm text-gray-900 border-b-2 border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-600"
                  placeholder="Experience (Years)"
                  required
                />
              </div>

              <div className="relative z-0 w-full group">
                <input
                  type="text"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className="block py-2.5 px-2 w-full text-sm text-gray-900 border-b-2 border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-600"
                  placeholder="Phone Number"
                  required
                />
              </div>

              <div className="relative z-0 w-full group col-span-3">
                <input
                  type="text"
                  name="desc"
                  value={formData.desc}
                  onChange={handleChange}
                  className="block py-2.5 px-2 w-full text-sm text-gray-900 border-b-2 border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-600"
                  placeholder="Introduce yourself"
                  required
                />
              </div>

              <div className="relative z-0 w-full group">
                <input
                  type="text"
                  name="availability"
                  value={formData.availability}
                  onChange={handleChange}
                  className="block py-2.5 px-2 w-full text-sm text-gray-900 border-b-2 border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-600"
                  placeholder="Availability (e.g., Mon-Wed)"
                  required
                />
              </div>

              <div className="relative z-0 w-full group">
                <input
                  type="text"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="block py-2.5 px-2 w-full text-sm text-gray-900 border-b-2 border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-600"
                  placeholder="Age"
                  required
                />
              </div>

              <div className="relative z-0 w-full group">
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="block w-full py-3 px-3 text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 sm:text-sm"
                  required
                >
                  <option value="" disabled>
                    Select Gender
                  </option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative z-0 w-full group">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="block py-2.5 px-2 w-full text-sm text-gray-900 border-b-2 border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-600"
                  placeholder="Password"
                  required
                />
              </div>

              <div className="relative z-0 w-full group">
                <input
                  type="password"
                  name="re_password"
                  value={formData.re_password}
                  onChange={handleChange}
                  className="block py-2.5 px-2 w-full text-sm text-gray-900 border-b-2 border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-600"
                  placeholder="Re-enter Password"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
            >
              Register
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TherapistLogin;
