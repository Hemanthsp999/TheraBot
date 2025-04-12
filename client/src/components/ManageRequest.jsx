import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./css/App.css";

const ManageRequests = () => {
  // State for client requests
  const [clientRequests, setClientRequests] = useState([
    {
      id: 1,
      name: "John Smith",
      requestDate: "April 10, 2025",
      requestType: "Anxiety Therapy",
      message:
        "I've been experiencing increased anxiety at work and would like to discuss coping strategies.",
      status: "pending",
    },
    {
      id: 2,
      name: "Emma Johnson",
      requestDate: "April 8, 2025",
      requestType: "Depression Counseling",
      message:
        "I'm seeking help for persistent feelings of sadness that have been affecting my daily life.",
      status: "pending",
    },
    {
      id: 3,
      name: "Michael Brown",
      requestDate: "April 7, 2025",
      requestType: "Relationship Counseling",
      message:
        "My partner and I are having communication issues and would like professional guidance.",
      status: "pending",
    },
  ]);

  // Handler for approving a request
  const handleApprove = (id) => {
    setClientRequests(
      clientRequests.map((request) =>
        request.id === id ? { ...request, status: "approved" } : request,
      ),
    );
    // In a real application, you would make an API call here to update the status
  };

  // Handler for declining a request
  const handleDecline = (id) => {
    setClientRequests(
      clientRequests.map((request) =>
        request.id === id ? { ...request, status: "declined" } : request,
      ),
    );
    // In a real application, you would make an API call here to update the status
  };

  // In a real application, you would fetch data from an API
  useEffect(() => {
    // Fetch client requests data
    // Example: fetchClientRequests().then(data => setClientRequests(data));
  }, []);

  return (
    <div className="ManageRequests mb-20  max-w-full bg-gray-100 min-h-screen py-10 px-4">
      {/* Header Section */}
      <header className="max-w-6xl mx-auto flex justify-between items-center bg-white shadow-md p-4 rounded-lg">
        <h1 className="text-2xl font-bold text-blue-800">
          📩 Manage Client Requests
        </h1>
        <Link
          to="/therapist"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700"
        >
          Back to Dashboard
        </Link>
      </header>

      {/* Requests List */}
      <section className="max-w-6xl mx-auto mt-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-blue-700 mb-4">
            New Client Requests
          </h2>

          {clientRequests.length === 0 ? (
            <p className="text-gray-600">
              No pending client requests at this time.
            </p>
          ) : (
            <div className="space-y-6">
              {clientRequests.map((request) => (
                <div
                  key={request.id}
                  className={`p-4 border rounded-lg ${
                    request.status === "approved"
                      ? "border-green-200 bg-green-50"
                      : request.status === "declined"
                        ? "border-red-200 bg-red-50"
                        : "border-gray-200"
                  }`}
                >
                  <div className="flex justify-between">
                    <h3 className="text-lg font-medium">{request.name}</h3>
                    <span className="text-sm text-gray-500">
                      Requested on: {request.requestDate}
                    </span>
                  </div>

                  <div className="mt-2">
                    <p className="text-gray-700">
                      <span className="font-medium">Type:</span>{" "}
                      {request.requestType}
                    </p>
                    <p className="text-gray-700 mt-1">
                      <span className="font-medium">Message:</span>{" "}
                      {request.message}
                    </p>
                  </div>

                  <div className="mt-4 flex justify-between items-center">
                    <div>
                      <span className="font-medium mr-2">Status:</span>
                      {request.status === "pending" && (
                        <span className="text-yellow-600">Pending</span>
                      )}
                      {request.status === "approved" && (
                        <span className="text-green-600">Approved</span>
                      )}
                      {request.status === "declined" && (
                        <span className="text-red-600">Declined</span>
                      )}
                    </div>

                    {request.status === "pending" && (
                      <div className="space-x-3">
                        <button
                          onClick={() => handleApprove(request.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleDecline(request.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Client History */}
      <section className="max-w-6xl mx-auto mt-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-blue-700 mb-4">
            Request History
          </h2>
          <p className="text-gray-600">
            View all past client requests and their statuses.
          </p>
          <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            View History
          </button>
        </div>
      </section>
    </div>
  );
};

export default ManageRequests;
