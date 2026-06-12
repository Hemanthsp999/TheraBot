import "aos/dist/aos.css";
import AOS from "aos";
import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import "./components/css/App.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AutoLogout from "./components/AutoLogout";

function App() {
  useEffect(() => {
    // Single robust initialization pass for clean document calculations
    AOS.init({
      duration: 800,
      easing: "ease-out",
      once: true, // Prevents repetitive jumping loops when scrolling over rows
    });
  }, []);

  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <AutoLogout />
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default App;
