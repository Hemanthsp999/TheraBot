import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AutoLogout = () => {
  const navigate = useNavigate();
  const [sessionExpired, setSessionExpired] = useState(false);

  console.log("✅ AutoLogout component mounted!"); // Ensure it's mounted

  useEffect(() => {
    console.log("🔄 AutoLogout useEffect running..."); // Ensure effect runs

    const checkSession = () => {
      const expiresAt = localStorage.getItem("expiresAt");

      if (!expiresAt) {
        console.log(
          "❌ No expiresAt found in localStorage. Please Login to track session!.",
        );
        return;
      }

      const expiryTime = new Date(expiresAt).getTime(); // Convert to milliseconds
      const currentTime = new Date().getTime(); // Current time in milliseconds

      console.log("🕒 Checking session...");
      console.log("Stored Expiry Time:", expiresAt);
      console.log("Current Time:", new Date().toISOString());
      console.log("Time Difference (ms):", expiryTime - currentTime);
      console.log("Session Expired?", currentTime >= expiryTime);

      if (currentTime >= expiryTime) {
        setSessionExpired(true);
        // alert("Session expired. Please log in again.");
        localStorage.clear();
        setTimeout(() => navigate("/login"), 3000);
      }
    };

    checkSession();

    const interval = setInterval(checkSession, 5000);

    return () => {
      console.log("⛔ AutoLogout component unmounted!");
      clearInterval(interval);
    };
  }, [navigate]);

  return (
    sessionExpired && (
      <div role="alert">
        <div className="bg-red-500 mt-8 text-white font-bold rounded-t-md px-4 py-2">
          Session Expired
        </div>
        <div className="border border-t-0 border-red-400 rounded-b-md bg-red-100 px-4 py-3 text-red-700">
          <p>Session Expired. Please Login again...</p>
        </div>
      </div>
    )
  );
};

export default AutoLogout;
