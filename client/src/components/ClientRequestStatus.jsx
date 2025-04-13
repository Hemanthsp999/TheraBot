import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./css/App.css";

const ClientRequestStatus = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const user_id = localStorage.getItem("user_id");

  const location = useLocation();

  const { request_type, therapist_name, request_date, notes, status } =
    location.state || {};

  useEffect(() => {
    const fetchRequestStatus = async () => {
      const access_token = localStorage.getItem("accessToken");
      const user_id = localStorage.getItem("user_id");
      const api_url = "http://127.0.0.1:8000/api/get_approval/";

      if (!access_token || !user_id) {
        setError("You need to log in to view your requests");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(api_url, {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
          params: { user_id: user_id },
        });

        //if (response.data && Array.isArray(response.data.response)) {
        console.log("Recieved", response.data.response);
        setRequests(response.data.response);
        //}

        setLoading(false);
      } catch (err) {
        console.error("Error fetching request status:", err);
        setError("Unable to load your request status. Please try again later.");
        setLoading(false);

        // For development/demo purposes only - mock data
        /*
        setRequests([
          {
            id: 1,
            therapist_name: "Dr. Sarah Johnson",
            request_date: "April 10, 2025",
            request_type: "Anxiety Therapy",
            notes:
              "I've been experiencing increased anxiety at work and would like to discuss coping strategies.",
            status: "approved",
            amount: 85.0,
          },
          {
            id: 2,
            therapist_name: "Dr. Michael Chen",
            request_date: "April 9, 2025",
            request_type: "Depression Counseling",
            notes:
              "I've been feeling down for several weeks and want to talk to someone.",
            status: "pending",
            amount: 90.0,
          },
          {
            id: 3,
            therapist_name: "Dr. Emily Rodriguez",
            request_date: "April 5, 2025",
            request_type: "Relationship Counseling",
            notes: "Having communication issues with my partner.",
            status: "declined",
            amount: 95.0,
          },
        ]);
        */
      }
    };

    fetchRequestStatus();
  }, []);

  const handleProceedToPayment = (requestId) => {
    // Navigate to payment form with the request ID
    console.log("In clientrequest",requestId)
    navigate(`payment/${requestId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
        <div className="text-red-500 text-xl mb-4">{error}</div>
        <Link
          to="/login"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="ClientRequestStatus bg-gray-100 min-h-screen py-10 px-4">
      {/* Header Section */}
      <header className="max-w-4xl mx-auto flex justify-between items-center bg-white shadow-md p-4 rounded-lg">
        <h1 className="text-2xl font-bold text-blue-800">
          🔔 My Therapy Requests
        </h1>
        <Link
          to="/"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700"
        >
          <span className="text-white">Back to Home </span>
        </Link>
      </header>

      {/* Request Status List */}
      <section className="max-w-4xl mx-auto mt-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-blue-700 mb-4">
            Your Request Status
          </h2>

          {requests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">
                You haven't made any therapy requests yet.
              </p>
              <Link
                to="/find-therapist"
                className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700"
              >
                Find a Therapist
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className={`p-4 border rounded-lg ${
                    request.status === "Approved"
                      ? "border-green-200 bg-green-50"
                      : request.status === "Declined"
                        ? "border-red-200 bg-red-50"
                        : "border-yellow-200 bg-yellow-50"
                  }`}
                >
                  <div className="flex justify-between">
                    <h3 className="text-lg font-medium">{therapist_name}</h3>
                    <span className="text-sm text-gray-500">
                      Requested on: {request_date || request.requestDate}
                    </span>
                  </div>

                  <div className="mt-2">
                    <p className="text-gray-700">
                      <span className="font-medium">Type:</span>{" "}
                      {request_type || request.type}
                    </p>
                    <p className="text-gray-700 mt-1">
                      <span className="font-medium">Your Message:</span>{" "}
                      {notes || request.note}
                    </p>
                    {request.status === "Approved" && (
                      <p className="text-gray-700 mt-1">
                        <span className="font-medium">Session Fee:</span> $
                        {/*{request.amount.toFixed(2)}*/}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 flex justify-between items-center">
                    <div>
                      <span className="font-medium mr-2">Status:</span>
                      {status === "Pending" ||
                        (request.status === "Pending" && (
                          <span className="py-1 px-2 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                            Pending Approval
                          </span>
                        ))}
                      {status === "Approved" ||
                        (request.status === "Approved" && (
                          <span className="py-1 px-2 bg-green-100 text-green-800 rounded-full text-sm">
                            Approved
                          </span>
                        ))}
                      {status === "Declined" ||
                        (request.status === "Declined" && (
                          <span className="py-1 px-2 bg-red-100 text-red-800 rounded-full text-sm">
                            Declined
                          </span>
                        ))}
                    </div>

                    {status === "Approved" ||
                      (request.status === "Approved" && (
                        <button
                          onClick={() => handleProceedToPayment(request.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700"
                        >
                          Proceed to Payment
                        </button>
                      ))}
                    {status === "Declined" ||
                      (request.status === "Declined" && (
                        <Link
                          to="/find-therapist"
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
                        >
                          Find Another Therapist
                        </Link>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Help Section */}
      <section className="max-w-4xl mx-auto mt-8 mb-10">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-blue-700 mb-4">
            Need Help?
          </h2>
          <p className="text-gray-600 mb-3">
            If you have questions about your request status or need assistance,
            please contact our support team.
          </p>
          <div className="flex items-center space-x-2 text-blue-600">
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M2 3a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H3a1 1 0 01-1-1V3zm2 2v10h14V5H4z"></path>
            </svg>
            <span>support@therapybooking.com</span>
          </div>
          <div className="flex items-center space-x-2 text-blue-600 mt-1">
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path>
            </svg>
            <span>(800) 123-4567</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ClientRequestStatus;
