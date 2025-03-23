import "./css/App.css";
import { useNavigate, Link } from "react-router-dom";

const TherapistLanding = () => {
  const navigate = useNavigate();
  //const user_type = localStorage.getItem("user_type");

  return (
    <div className="TherapistHome max-w-full bg-gray-100 min-h-screen py-10 px-4">
      {/* Header Section */}
      <header className="max-w-6xl mx-auto flex justify-between items-center bg-white shadow-md p-4 rounded-lg">
        <h1 className="text-2xl font-bold text-blue-800">
          👨‍⚕️ Therapist Dashboard
        </h1>
        <button
          onClick={() => navigate("/therapist/profile")}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700"
        >
          Profile Settings
        </button>
      </header>

      {/* Dashboard Grid */}
      <section className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
        {/* Upcoming Sessions */}
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-blue-700">
            📅 Upcoming Sessions
          </h2>
          <p className="mt-2 text-gray-600">
            Check your next scheduled appointments.
          </p>
          <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Link to={"/therapist/patients"}>View Schedule</Link>
          </button>
        </div>

        {/* New Client Requests */}
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-blue-700">
            📩 Client Requests
          </h2>
          <p className="mt-2 text-gray-600">
            Approve or decline new therapy requests.
          </p>
          <button className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Manage Requests
          </button>
        </div>

        {/* Messages & Notifications */}
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-blue-700">
            💬 Messages & Notifications
          </h2>
          <p className="mt-2 text-gray-600">Check new messages from clients.</p>
          <button className="mt-3 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600">
            <Link to={"/therapist/chat"}>Open Inbox</Link>
          </button>
        </div>
      </section>

      {/* Additional Resources */}
      <section className="max-w-6xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-blue-700">
          📚 Therapist Resources
        </h2>
        <p className="mt-2 text-gray-600">
          Access guides, training materials, and FAQs.
        </p>
        <button className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
          Explore Resources
        </button>
      </section>
    </div>
  );
};

export default TherapistLanding;
