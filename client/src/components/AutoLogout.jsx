import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./css/App.css";

const AutoLogout = () => {
  const navigate = useNavigate();
  const [sessionExpired, setSessionExpired] = useState(false);

  const logout_api = "http://127.0.0.1:8000/api/logout/";
  const access_token = localStorage.getItem("accessToken");
  const refresh_token = localStorage.getItem("refreshToken");

  console.log("✅ AutoLogout component mounted!"); // Ensure it's mounted

  useEffect(() => {
    console.log("🔄 AutoLogout useEffect running..."); // Ensure effect runs

    const checkSession = async () => {
      const expiresAt = localStorage.getItem("expiresAt");

      if (!expiresAt) {
        console.log(
          " No expiresAt found in localStorage. Please Login to track session!.",
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
        try {
          const logout = await axios.post(
            logout_api,
            { refreshToken: refresh_token },
            {
              headers: {
                Authorization: `Bearer ${access_token}`,
                "Content-Type": "application/json",
              },
            },
          );
          console.log("Logout response: ", logout.data);
          setTimeout(() => navigate(logout.data.redirect_url), 3000);
          navigate(logout.data.redirect_url);
          localStorage.clear();
        } catch (e) {
          console.error(e);
        }
        localStorage.clear();
      }
    };

    checkSession();

    const interval = setInterval(checkSession, 5000);

    return () => {
      console.log("⛔ AutoLogout component unmounted!");
      clearInterval(interval);
    };
  }, [navigate, access_token, refresh_token]);

  return (
    sessionExpired && (
      <div className="static inset-0 flex items-start justify-center pt-10 z-50">
        <div className="w-full max-w-md bg-red-500 text-white text-center rounded-md shadow-lg p-4">
          <strong>Session Expired</strong>
          <p>Please log in again...</p>
        </div>
      </div>
    )
  );
};

export default AutoLogout;
