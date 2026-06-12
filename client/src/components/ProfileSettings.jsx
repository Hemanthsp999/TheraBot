import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const ProfileSettings = () => {
  const navigate = useNavigate();
  const get_name = localStorage.getItem("name");
  const get_email = localStorage.getItem("userEmail"); // Fixed key name for consistency
  
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleLogout = async () => {
    // ... your existing logout logic ...
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#F2F5F3] p-4 md:p-8 flex justify-center">
      <div className="bg-white shadow-xl rounded-3xl w-full max-w-5xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-indigo-900 text-white p-8 flex flex-col">
          <h2 className="text-xl font-bold mb-8">Settings</h2>
          <nav className="flex flex-col gap-4">
            <Link to="/therapist" className="hover:text-indigo-300 transition">Dashboard</Link>
            <Link to="#" className="hover:text-indigo-300 transition">Billing</Link>
            <Link to="#" className="text-indigo-300 font-semibold">Security</Link>
            <button onClick={handleLogout} className="mt-auto text-left text-red-400 hover:text-red-300 transition font-bold">
              Log Out
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 md:p-12 bg-white">
          <header className="mb-10">
            <h1 className="text-3xl font-bold text-slate-800">Profile Settings</h1>
            <p className="text-slate-500">Manage your personal information and security.</p>
          </header>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Profile Card */}
            <section>
              <h3 className="text-sm uppercase tracking-widest text-slate-400 font-bold mb-4">Account Details</h3>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <p className="mb-3"><strong>Name:</strong> {get_name}</p>
                <p className="mb-3"><strong>Email:</strong> {get_email}</p>
                <p><strong>Role:</strong> Licensed Therapist</p>
              </div>
            </section>

            {/* Password Form */}
            <section>
              <h3 className="text-sm uppercase tracking-widest text-slate-400 font-bold mb-4">Change Password</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <input type="password" name="oldPassword" placeholder="Current Password" value={passwords.oldPassword} onChange={handleChange}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition" />
                <input type="password" name="newPassword" placeholder="New Password" value={passwords.newPassword} onChange={handleChange}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition" />
                <input type="password" name="confirmPassword" placeholder="Confirm Password" value={passwords.confirmPassword} onChange={handleChange}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition" />
                <button className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition active:scale-95">
                  Save Changes
                </button>
              </form>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfileSettings;
