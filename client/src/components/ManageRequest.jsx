import axios from "axios";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./css/App.css";

const ManageRequests = () => {
  // State for client requests
  const [clientRequests, setClientRequests] = useState([]);

  // Handler for approving a request
  const access_token = localStorage.getItem("accessToken");
  const therapist_id = localStorage.getItem("therapist_id");
  const handleApprove = async (id) => {
    const api = "http://127.0.0.1:8000/api/make_approve/";
    try {
      const makeApprove = await axios.post(
        api,
        {
          therapist_id: therapist_id,
          booking_id: id,
          is_approved: "Approved",
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
        },
      );
      setClientRequests(
        clientRequests.map((request) =>
          request.id === id ? { ...request, status: "Approved" } : request,
        ),
      );
    } catch (e) {
      console.error(e);
    }

    // In a real application, you would make an API call here to update the status
  };

  // Handler for declining a request
  const handleDecline = async (id) => {
    const api = "http://127.0.0.1:8000/api/make_approve/";

    try {
      const decline = await axios.post(
        api,
        {
          therapist_id: therapist_id,
          booking_id: id,
          is_approved: "Declined",
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
        },
      );
            console.log(decline.data.response)
      setClientRequests(
        clientRequests.map((request) =>
          request.id === id ? { ...request, status: "declined" } : request,
        ),
      );
    } catch (e) {
      console.error(e);
    }
    // In a real application, you would make an API call here to update the status
  };

  // In a real application, you would fetch data from an API
  useEffect(() => {
    // Fetch client requests data
    // Example: fetchClientRequests().then(data => setClientRequests(data));
    const fetchClientRequests = async () => {
      const api_url = "http://127.0.0.1:8000/api/get_pending_clients/";

      try {
        console.log("therapist id", therapist_id);
        console.log(access_token);
        if (!access_token) {
          return;
        }
        const clientList = await axios.get(api_url, {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
          params: { therapist_id: therapist_id },
        });

        if (Array.isArray(clientList.data.response)) {
          console.log(clientList.data.response);
          setClientRequests(clientList.data.response);
        }
      } catch (e) {
        console.error(e);
      }
    };

    fetchClientRequests();
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
          className="px-4 py-2 bg-indigo-600 mx-1 rounded-lg shadow hover:bg-indigo-700"
        >
          <span className="text-gray-100">Back to Dashboard</span>
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
                      <span className="font-medium mr-2 text-black">Status:</span>
                      {request.status === "Pending" && (
                        <span className="text-yellow-600 bg-yellow-100 text-yellow-800">Pending</span>
                      )}
                      {request.status === "approved" && (
                        <span className="text-green-600">Approved</span>
                      )}
                      {request.status === "declined" && (
                        <span className="text-red-600">Declined</span>
                      )}
                    </div>

                    {request.status === "Pending" && (
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
