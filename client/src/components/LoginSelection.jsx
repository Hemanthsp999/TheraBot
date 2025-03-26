import React from "react";
import { useNavigate } from "react-router-dom";

const LoginSelection = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-4xl w-full">
        <h1 className="text-3xl font-bold text-center text-black mb-8">
          Choose Login Type
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Login Card */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="p-8">
              <div className="text-center mb-4">
                <h2 className="text-2xl font-semibold text-black mb-2">
                  User Login
                </h2>
                <p className="text-gray-600">Access your personal account</p>
              </div>
              <button
                onClick={() => navigate("/login")}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300"
              >
                Login as User
              </button>
            </div>
          </div>

          {/* Therapist Login Card */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="p-8">
              <div className="text-center mb-4">
                <h2 className="text-2xl font-semibold text-black mb-2">
                  Therapist Login
                </h2>
                <p className="text-gray-600">
                  Access your professional account
                </p>
              </div>
              <button
                onClick={() => navigate("/login")}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors duration-300"
              >
                Login as Therapist
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginSelection;
