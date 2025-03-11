import "aos/dist/aos.css";
import AOS from "aos";
import { Outlet, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
//import AnimateIn from "./components/AnimateIn.tsx";
import "./components/css/App.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AutoLogout from "./components/AutoLogout"; // Fixed import name
import PatientsPage from './pages/PatientsPage';
import PatientDetailPage from './pages/PatientDetailPage';
import TherapistChat from './pages/TherapistChat';

// Import all the components that were in the router
import Landingpage from "./components/Landingpage";
import Login from "./components/Login";
import Register from "./components/Register";
import Forgetpassword from "./components/ForgetPassword";
import About from "./components/About";
import Contact from "./components/Contact";
import Therapist from "./components/Therapist";
import Service from "./components/Service";
import Protected from "./components/ProtectedRoute";
import AccessAccount from "./components/AccessAccount";
import TherapistLogin from "./components/TherapistLogin";
import TherapistRegister from "./components/TherapistRegistration";
import ChatBot from "./components/ChatBot";

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
    <Routes>
      {/* Protected Patients routes - now standalone with their own navbar/footer */}
      <Route element={<Protected />}>
        <Route path="/patients" element={<PatientsPage />} />
        <Route path="/patients/:id" element={<PatientDetailPage />} />
        <Route path="/chat" element={<TherapistChat />} />
      </Route>

      {/* Protected ChatBot route */}
      <Route path="/chatbot" element={<Protected />}>
        <Route index element={<ChatBot />} />
      </Route>

      {/* Main layout with Navbar and Footer */}
      <Route path="/" element={
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
          <Footer />
        </div>
      }>
        {/* Index route */}
        <Route index element={<Landingpage />} />

        {/* Auth routes */}
        <Route path="access-account" element={<AccessAccount />} />
        <Route path="login" element={<Login />} />
        <Route path="therapist-login" element={<TherapistLogin />} />
        <Route path="signup" element={<Register />} />
        <Route path="register" element={<TherapistRegister />} />
        <Route path="forget" element={<Forgetpassword />} />

        {/* Content pages */}
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="services" element={<Service />} />

        {/* Protected therapist route */}
        <Route path="therapist" element={<Protected />}>
          <Route index element={<Therapist />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
