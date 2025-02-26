import "aos/dist/aos.css";
import AOS from "aos";
import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
//import AnimateIn from "./components/AnimateIn.tsx";
import "./components/css/App.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AutoLogout from "./components/AutoLogout"; // Fixed import name

function App() {
  const [scrollingUp, setScrollingUp] = useState(false);

  useEffect(() => {
    // Initialize AOS
    AOS.init({
      duration: 1000,
      easing: "ease-out",
      once: false,
    });

    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      if (window.scrollY < lastScrollY) {
        setScrollingUp(true);
      } else {
        setScrollingUp(false);
      }
      lastScrollY = window.scrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    AOS.refresh();
  }, [scrollingUp]);

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden overflow-y-hidden">
      <Navbar />
      {/*
      <AnimateIn
        from="opacity-0 scale-70"
        to="opacity-100 scale-100"
        duration={1000}
      >
      */}
      <main className="flex-1">
        <AutoLogout /> {/* Fixed component casing */}
        <Outlet />
      </main>
      {/* </AnimateIn>*/}
      <div className="mt-20 sm:mt-30 xs:mt-400">
        <Footer />
      </div>
    </div>
  );
}

export default App;
