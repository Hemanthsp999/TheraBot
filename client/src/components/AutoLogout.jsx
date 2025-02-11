import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AutoLogout = () => {
    const navigate = useNavigate();

    console.log("✅ AutoLogout component mounted!"); // Ensure it's mounted

    useEffect(() => {
        console.log("🔄 AutoLogout useEffect running..."); // Ensure effect runs

        const checkSession = () => {
            const expiresAt = localStorage.getItem("expiresAt");

            if (!expiresAt) {
                console.log("❌ No expiresAt found in localStorage. Please Login to track session!.");
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
                alert("Session expired. Please log in again.");
                localStorage.clear();
                navigate("/login");
            }
        };

        checkSession();

        const interval = setInterval(checkSession, 5000);

        return () => {
            console.log("⛔ AutoLogout component unmounted!");
            clearInterval(interval);
        };
    }, [navigate]);

    return null;
};

export default AutoLogout;

