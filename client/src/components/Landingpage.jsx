import "./css/App.css";
import axios from "axios";
import { useRef, useEffect, useState } from "react";
import Slider from "react-slick";
import { useNavigate, Navigate } from "react-router-dom";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { 
  Bot as BotIcon, 
  UserCheck, 
  Heart, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  MessageSquare, 
  ArrowRight, 
  Smile, 
  Activity, 
  Users 
} from "lucide-react";

import carsouel1 from "./images/Carsouel1.jpg";
import carsouel2 from "./images/Carsouel2.jpg";
import carsouel3 from "./images/Carsouel.webp";
import carsouel from "./images/Bot_Human.png";
import Carsouel5 from "./images/stress.jpg";
import PatientInfoModal from "./PatientInfoModal.jsx";

const LandingPage = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
    customPaging: (i) => (
      <div className="w-2.5 h-2.5 mx-1 bg-gray-300 rounded-full transition-all duration-300 dot-custom" />
    ),
  };

  const navigate = useNavigate();
  const sectionRef = useRef(null);

  const user = localStorage.getItem("user_type");
  const patient_history = localStorage.getItem("patient_history");
  const [showModal, setShowModal] = useState(false);

  // Redirect if User is a Therapist
  if (user === "therapist") {
    return <Navigate to="/therapist" />;
  }

  // Sync Patient Info Checking Hook
  useEffect(() => {
    const api_url = "http://127.0.0.1:8000/api/is_patient_info_exists/";
    const get_patient_info = async () => {
      try {
        const resp = await axios.get(api_url, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          params: { user_id: localStorage.getItem("user_id") },
        });
        localStorage.setItem("patient_history", resp.data.patient_history);
      } catch (e) {
        console.error("Failed to sync patient data status:", e);
      }
    };

    if (localStorage.getItem("accessToken")) {
      get_patient_info();
      const interval = setInterval(get_patient_info, 10000);
      return () => clearInterval(interval);
    }
  }, [patient_history]);

  useEffect(() => {
    setShowModal(true);
  }, []);

  const scrollToSection = () => {
    sectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (

    <div className="Landingpage w-full min-h-screen bg-gradient-to-b from-[#F2F5F3] via-[#FAFBFB] to-[#F2F5F3] overflow-x-hidden">

      {patient_history === "false" && (
        <PatientInfoModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSubmit={""}
          userId={localStorage.getItem("user_id")}
        />
      )}

      {/* Hero Accent Grid Layer */}
      <section className="relative max-w-5xl px-4 mx-auto text-center pt-16 pb-12 md:pt-24 md:pb-16">
        <div className="absolute inset-0 -z-10 flex items-center justify-center opacity-30 blur-3xl pointer-events-none">
          <div className="w-[300px] h-[300px] bg-blue-400 rounded-full mix-blend-multiply filter animate-pulse" />
          <div className="w-[250px] h-[250px] bg-indigo-300 rounded-full mix-blend-multiply filter animate-pulse delay-700" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-6 animate-bounce">
          <Sparkles size={14} />
          <span>Your 24/7 Virtual Safe Space</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-none mb-6">
          Meet <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700">TheraBot</span>: Your AI Mental Health Companion
        </h1>
        
        <p className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-gray-600 font-normal leading-relaxed mb-8">
          A judgment-free workspace designed to help you express, reflect, and heal — entirely on your terms, anytime, anywhere.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={scrollToSection}
            className="group w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            <MessageSquare size={18} />
            <span>Begin Journey</span>
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </section>

      {/* Carousel Core Interactive Block */}
      <div className="max-w-4xl mx-auto px-4 mb-16 md:mb-24">
        <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white border border-gray-100 p-2 group">
          <Slider {...settings}>
            {[carsouel, carsouel1, carsouel2, carsouel3, Carsouel5].map((image, index) => (
              <div key={index} className="outline-none">
                <div className="relative overflow-hidden rounded-xl bg-gray-50">
                  <img
                    className="w-full h-[240px] sm:h-[360px] md:h-[420px] object-cover transition-transform duration-700 group-hover:scale-[1.01]"
                    src={image}
                    alt={`Wellness Slide ${index + 1}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>

      {/* Trust & Metrics Section (Helpful Content Addition) */}
      <section className="max-w-6xl mx-auto px-4 mb-16 md:mb-24 border-y border-gray-100 py-10 bg-white/50 backdrop-blur-sm rounded-3xl">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div className="space-y-1">
            <div className="text-3xl md:text-4xl font-extrabold text-blue-600 flex items-center justify-center gap-1">
              <Smile size={28} className="text-blue-500" /> 24/7
            </div>
            <p className="text-sm font-medium text-gray-500">Instant Availability</p>
          </div>
          <div className="space-y-1">
            <div className="text-3xl md:text-4xl font-extrabold text-indigo-600 flex items-center justify-center gap-1">
              <ShieldCheck size={28} className="text-indigo-500" /> 100%
            </div>
            <p className="text-sm font-medium text-gray-500">Private & Secure</p>
          </div>
          <div className="space-y-1">
            <div className="text-3xl md:text-4xl font-extrabold text-emerald-600 flex items-center justify-center gap-1">
              <Users size={28} className="text-emerald-500" /> Certified
            </div>
            <p className="text-sm font-medium text-gray-500">Professional Therapist Network</p>
          </div>
        </div>
      </section>

      {/* Feature Utility Architecture */}
      <section className="w-full max-w-6xl mx-auto px-4 mb-16 md:mb-24">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-3">
            Why Choose TheraBot?
          </h2>
          <p className="text-sm sm:text-base text-gray-500 max-w-lg mx-auto">
            Prioritizing your emotional health with modern, comprehensive support pillars built for real life.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: <Heart className="text-rose-500" size={24} />,
              title: "Evidence-Based Support",
              desc: "Engineered around reliable cognitive-behavioral insights.",
            },
            { 
              icon: <MessageSquare className="text-blue-500" size={24} />, 
              title: "Judgment-Free Zone", 
              desc: "A entirely neutral, conversational listener open day or night." 
            },
            {
              icon: <Activity className="text-amber-500" size={24} />,
              title: "Mindfulness & Clarity",
              desc: "Practical guidance tools engineered to lower stress levels.",
            },
            {
              icon: <Clock className="text-emerald-500" size={24} />,
              title: "Instant Access Always",
              desc: "Skip waiting rooms entirely. Connect at the exact second you need assistance.",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="group p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between"
            >
              <div>
                <div className="p-3 bg-gray-50 rounded-xl w-fit mb-4 group-hover:bg-blue-50 transition-colors">
                  {item.icon}
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Array Block */}
      <section className="w-full max-w-4xl mx-auto px-4 mb-16 md:mb-24">
        <div className="bg-gradient-to-br from-blue-900 to-indigo-950 rounded-3xl shadow-xl p-8 md:p-12 text-center text-white relative overflow-hidden">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl" />
          <h2 className="text-2xl md:text-3xl font-bold mb-6">What Users Experience</h2>
          <div className="max-w-2xl mx-auto">
            <p className="text-base sm:text-lg md:text-xl font-medium italic leading-relaxed text-blue-100 mb-4">
              "TheraBot feels like a compassionate friend that never gets tired of listening. It fundamentally changed how I approach and navigate daily anxiety peaks."
            </p>
            <div className="w-8 h-1 bg-blue-500 mx-auto rounded-full mb-3" />
            <p className="text-xs sm:text-sm font-semibold tracking-wider text-blue-300 uppercase">
              — Verified Platform User
            </p>
          </div>
        </div>
      </section>

      {/* Gateway Controls Workspace Selection Panel */}
      <div ref={sectionRef} className="w-full max-w-5xl mx-auto px-4 pb-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            Find Your Match for Mental Wellness
          </h2>
          <p className="text-sm sm:text-base text-gray-500 max-w-2xl mx-auto">
            Whether you choose an immediate AI conversation or tailored, deeply personalized coaching with professional counselors, your data path remains completely private.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Card A: Chatbot Control */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-8 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl w-fit mb-5">
                <BotIcon size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Talk with AI Chatbot</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-6">
                Instant interactive logs accessible 24/7. Perfect for working through passing thoughts or immediate situational reflections safely without standard appointments.
              </p>
            </div>
            <button
              onClick={() => navigate("/user/chatbot")}
              className="w-full py-3 px-5 font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-600/10 transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <span>Initialize Chatbot</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Card B: Therapist Control */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-8 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-fit mb-5">
                <UserCheck size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Connect with a Therapist</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-6">
                Schedule personal programmatic check-ins with licensed therapists for extensive, programmatic care custom-tailored around your specific timeline updates.
              </p>
            </div>
            <button
              onClick={() => navigate("/user/therapist")}
              className="w-full py-3 px-5 font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-600/10 transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <span>Consult Professional</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Structural Breakdown: How it works workflow block */}
        <div className="mt-16 bg-gray-50 rounded-2xl border border-gray-100 p-6 md:p-10 max-w-4xl mx-auto">
          <h3 className="text-xl font-bold text-gray-900 text-center mb-8">How it works</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <span className="font-extrabold text-blue-600 text-sm tracking-wide uppercase block mb-1">Step 01</span>
              <h4 className="font-bold text-gray-900 mb-2">Self Reflection Entry</h4>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Log items natively through our structured platform prompts or use unstructured freeform text within the secure conversation node dashboard.
              </p>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <span className="font-extrabold text-emerald-600 text-sm tracking-wide uppercase block mb-1">Step 02</span>
              <h4 className="font-bold text-gray-900 mb-2">Adaptive Response Sync</h4>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Leverage immediate cognitive insights generated via TheraBot or securely handoff metrics to your provider ahead of scheduled workspace meetups.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LandingPage;
