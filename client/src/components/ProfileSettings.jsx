import axios from "axios";
import { useState } from "react";
import { Link } from "react-router-dom";

const ProfileSettings = () => {
  const therapist = {
    name: "Dr. John Doe",
    email: "john.doe@example.com",
    credentials: "PhD, Licensed Therapist",
  };

  const get_name = localStorage.getItem("name");
  const get_email = localStorage.getItem("email");

  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleLogout = async () => {
    const access_token = localStorage.getItem("accessToken");
    const refresh_token = localStorage.getItem("refreshToken");
    const logout_api = "http://127.0.0.1:8000/api/logout/";

    try {
      const resp = await axios.post(
        logout_api,
        { refreshToken: refresh_token },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
        },
      );

      console.log(resp.data.message);
      localStorage.clear();
    } catch (e) {
      console.log(e.response?.data);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 p-4">
      {/* Container Box */}
      <div className="bg-white shadow-lg rounded-lg w-full max-w-4xl p-6 md:p-10 flex flex-col md:flex-row">
        {/* Sidebar */}
        <div className="w-full md:w-1/3 bg-blue-600 text-white p-6 rounded-l-lg flex flex-col items-center">
          <div className="bg-white text-blue-600 p-3 rounded-full mb-4">
            <svg
              className="w-10 h-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 14l9-5-9-5-9 5 9 5z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 14l6.16-3.422M6 9.578L12 14"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 14V21"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold">Welcome, {get_name}</h2>

          <nav className="mt-6 space-y-3 grid text-center text-black">
            <Link to={"/therapist"}>
              <p className="hover:underline cursor-pointer text-white">
                Dashboard
              </p>
            </Link>
            {/*
            <p className="hover:underline cursor-pointer text-white">
              New Translation
            </p>
            <p className="hover:underline cursor-pointer">My Projects</p>
            <p className="hover:underline cursor-pointer">My Translations</p>
            */}
            <Link to={""}>
              <p className="hover:underline cursor-pointer text-white">
                Billing & Payment
              </p>
            </Link>
            <Link to={""}>
              <p className="hover:underline cursor-pointer text-white">
                Settings
              </p>
            </Link>
            <button className="hover:underline cursor-pointer text-red-400">
              <b>Log Out</b>
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-5 text-center">
            Your Personal Profile Info
          </h2>

          {/* Profile & Password Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Profile Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3 bg-black rounded-lg">
                Profile
              </h3>
              <div className="space-y-3 p-4 border rounded-lg shadow-sm bg-gray-900">
                <p>
                  <strong>Name:</strong> {get_name}
                </p>
                <p>
                  <strong>Email:</strong> {get_email}
                </p>
                <p>
                  <strong>Credentials:</strong> {therapist.credentials}
                </p>
              </div>
            </div>

            {/* Password Section */}
            <div>
              <h3 className="text-lg bg-black font-semibold mb-3 rounded-lg">
                Password
              </h3>
              <div className="space-y-3 p-4 border rounded-lg shadow-sm bg-gray-900">
                <input
                  type="password"
                  name="oldPassword"
                  value={passwords.oldPassword}
                  onChange={handleChange}
                  placeholder="Old Password"
                  className="w-full p-2 border rounded"
                />
                <input
                  type="password"
                  name="newPassword"
                  value={passwords.newPassword}
                  onChange={handleChange}
                  placeholder="New Password"
                  className="w-full p-2 border rounded"
                />
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwords.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm New Password"
                  className="w-full p-2 border rounded"
                />
                <button className="w-full bg-blue-600 text-white p-2 rounded mt-2 hover:bg-blue-700">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
