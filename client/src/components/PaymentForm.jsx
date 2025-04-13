import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./css/App.css";

const PaymentForm = () => {
  let { requestId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionDetails, setSessionDetails] = useState(null);

  // Payment form state
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expDate, setExpDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    const fetchSessionDetails = async () => {
      const access_token = localStorage.getItem("accessToken");
      const user_id = localStorage.getItem("user_id");
      const api_url = `http://127.0.0.1:8000/api/get_session_details/?request_id=${parseInt(requestId, 10)}`;

      if (!access_token || !user_id) {
        setError("You need to log in to complete payment");
        setLoading(false);
        return;
      }

      try {
        console.log(requestId);
        const response = await axios.get(api_url, {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
          params: { user_id: user_id },
        });

        if (response.data && response.data.response) {
          setSessionDetails(response.data.response);
        } else {
          setError("Unable to load session details");
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching session details:", err);
        setError("Unable to load session details. Please try again later.");
        setLoading(false);

        // For development/demo purposes only - mock data
        setSessionDetails({
          id: requestId,
          therapist_name: "Dr. Sarah Johnson",
          request_date: "April 10, 2025",
          session_date: "April 17, 2025",
          session_time: "10:00 AM",
          request_type: "Anxiety Therapy",
          amount: 85.0,
          duration: "50 minutes",
        });
      }
    };

    fetchSessionDetails();
  }, [requestId]);

  const handleCardNumberChange = (e) => {
    // Format card number with spaces for readability (4 digits + space)
    const value = e.target.value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const formattedValue = value.replace(/\B(?=(\d{4})+(?!\d))/g, " ");
    setCardNumber(formattedValue);
  };

  const handleExpDateChange = (e) => {
    // Format exp date as MM/YY
    const value = e.target.value.replace(/\//g, "").replace(/[^0-9]/gi, "");
    if (value.length <= 2) {
      setExpDate(value);
    } else {
      setExpDate(`${value.substring(0, 2)}/${value.substring(2, 4)}`);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    // Validate form
    if (
      !cardName ||
      cardNumber.replace(/\s+/g, "").length < 16 ||
      expDate.length < 5 ||
      cvv.length < 3
    ) {
      setError("Please fill in all payment details correctly");
      setIsProcessing(false);
      return;
    }

    // Simulate a payment processing delay
    setTimeout(async () => {
      try {
        // In a real app, you would call your payment processing API here
        // const response = await axios.post("http://127.0.0.1:8000/api/process_payment/", {
        //   request_id: requestId,
        //   // Don't send actual card info in clear text in a real app! Use a secure payment processor
        //   payment_token: "mock_token_for_demo",
        // });

        // Simulate successful payment
        setPaymentSuccess(true);
        setIsProcessing(false);
      } catch (err) {
        console.error("Payment processing error:", err);
        setError("Payment processing failed. Please try again.");
        setIsProcessing(false);
      }
    }, 2000);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && !sessionDetails) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
        <div className="text-red-500 text-xl mb-4">{error}</div>
        <Link
          to="/request-status"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
        >
          Back to Requests
        </Link>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="bg-gray-100 min-h-screen py-10 px-4">
        <div className="max-w-lg mx-auto bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">
            Payment Successful!
          </h2>
          <p className="text-gray-600 mb-6">
            Your therapy session with {sessionDetails.therapist_name} has been
            booked for {sessionDetails.session_date} at{" "}
            {sessionDetails.session_time}.
          </p>
          <p className="text-gray-600 mb-6">
            You'll receive a confirmation email with all the details and
            instructions for your session.
          </p>
          <div className="flex flex-col space-y-3">
            <Link
              to="/dashboard"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
            >
              <span className="text-black">Go to Dashboard</span>
            </Link>
            <Link
              to="chat"
              className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700"
            >
              <span className="text-black">View My Sessions</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="PaymentForm bg-gray-100 min-h-screen py-10 px-4">
      {/* Header Section */}
      <header className="max-w-4xl mx-auto flex justify-between items-center bg-white shadow-md p-4 rounded-lg">
        <h1 className="text-2xl font-bold text-blue-800">
          💳 Complete Your Payment
        </h1>
        <Link
          to="/request-status"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700"
        >
          Back to Requests
        </Link>
      </header>

      {/* Payment Section */}
      <div className="max-w-4xl mx-auto mt-8 flex flex-col md:flex-row gap-8">
        {/* Session Details Card */}
        <div className="bg-white rounded-lg shadow-md p-6 md:w-1/3">
          <h2 className="text-xl font-semibold text-blue-700 mb-4">
            Session Details
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Therapist</p>
              <p className="font-medium text-black">
                {sessionDetails.therapist}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Session Type</p>
              <p className="font-medium text-black">
                {sessionDetails.session_type}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date & Time</p>
              <p className="font-medium text-black">
                {sessionDetails.Date} at {sessionDetails.Time}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Duration</p>
              <p className="font-medium">{sessionDetails.duration}</p>
            </div>
            <div className="pt-3 border-t">
              <p className="text-sm text-gray-500">Amount Due</p>
              <p className="text-2xl font-bold text-blue-700">
                {/*${sessionDetails.amount.toFixed(2)}*/}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <div className="bg-white rounded-lg shadow-md p-6 md:w-2/3">
          <h2 className="text-xl font-semibold text-blue-700 mb-4">
            Payment Information
          </h2>

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="cardName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Name on Card
              </label>
              <input
                type="text"
                id="cardName"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                className="w-full p-3 border border-gray-300 text-black rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="John Smith"
                required
              />
            </div>

            <div>
              <label
                htmlFor="cardNumber"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Card Number
              </label>
              <input
                type="text"
                id="cardNumber"
                value={cardNumber}
                onChange={handleCardNumberChange}
                className="w-full text-black p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="1234 5678 9012 3456"
                maxLength="19"
                required
              />
            </div>

            <div className="flex space-x-4">
              <div className="w-1/2">
                <label
                  htmlFor="expDate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Expiration Date
                </label>
                <input
                  type="text"
                  id="expDate"
                  value={expDate}
                  onChange={handleExpDateChange}
                  className="w-full text-black p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="MM/YY"
                  maxLength="5"
                  required
                />
              </div>
              <div className="w-1/2">
                <label
                  htmlFor="cvv"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  CVV
                </label>
                <input
                  type="text"
                  id="cvv"
                  value={cvv}
                  onChange={(e) =>
                    setCvv(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))
                  }
                  className="w-full p-3 border text-black border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="123"
                  maxLength="4"
                  required
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className={`w-full py-3 px-4 rounded-md text-white font-medium ${
                  isProcessing ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
                }`}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  `Pay $ ${
                    {
                      /*sessionDetails.amount.toFixed(2)*/
                    }
                  }`
                )}
              </button>
            </div>

            <div className="text-xs text-gray-500 text-center mt-4">
              <p>Your payment information is encrypted and secure.</p>
              <p className="mt-1">
                By clicking "Pay", you agree to our Terms of Service and Privacy
                Policy.
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Secure Payment Notice */}
      <div className="max-w-4xl mx-auto mt-8 mb-10 bg-gray-50 rounded-lg shadow-sm p-4">
        <div className="flex items-center space-x-3">
          <svg
            className="w-6 h-6 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            ></path>
          </svg>
          <span className="text-gray-700">
            Secure payment processing. Your card details are encrypted and never
            stored on our servers.
          </span>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;
