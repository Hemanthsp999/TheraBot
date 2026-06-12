import React from "react";
import { useNavigate } from "react-router-dom";

const LoginSelection = () => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex items-center justify-center bg-[#F2F5F3] px-4 py-16">
      <div className="max-w-3xl w-full" data-aos="fade-up">
        <h1 className="text-3xl md:text-4xl font-extrabold text-center text-slate-900 mb-3 tracking-tight">
          Choose Account Portal
        </h1>
        <p className="text-center text-gray-500 text-sm sm:text-base max-w-sm mx-auto mb-10">
          Select your destination below to access your secure profile node.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Portal Block */}
          <div className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between p-6 sm:p-8">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl mx-auto flex items-center justify-center text-xl font-bold mb-3">👤</div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">User Lounge</h2>
              <p className="text-xs sm:text-sm text-gray-500">Access personal companion logs, self-evaluations, and chat channels</p>
            </div>
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 font-bold rounded-xl shadow-sm transition"
            >
              Login as User
            </button>
          </div>

          {/* Clinician Portal Block */}
          <div className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between p-6 sm:p-8">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl mx-auto flex items-center justify-center text-xl font-bold mb-3">📋</div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">Therapist Office</h2>
              <p className="text-xs sm:text-sm text-gray-500">Access clinical assignments, analytical diagnostic logs, and patient records</p>
            </div>
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 font-bold rounded-xl shadow-sm transition"
            >
              Login as Therapist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginSelection;
