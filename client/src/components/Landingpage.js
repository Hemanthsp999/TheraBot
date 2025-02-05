import { React, useRef } from "react";
import Slider from "react-slick";
import { useNavigate } from 'react-router-dom';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import carsouel1 from './images/Carsouel1.jpg';
import carsouel2 from './images/Carsouel2.jpg';
import carsouel3 from './images/Carsouel.webp';
import carsouel from './images/Bot_Human.png';
import Carsouel5 from './images/stress.jpg';

const LandingPage = () => {
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 2000,
        arrows: true
    };

    const navigate = useNavigate();
    const sectionRef = useRef(null);

    const scrollToSection = () =>{
        sectionRef.current?.scrollIntoView({ behavior: "smooth"});
    };

    return (
        <>
            {/* Hero Section */}
            <section className="hero text-center mt-10 px-6 animate-fadeInDown">
                <h1 className="text-2xl font-bold text-blue-700">
                    🤖 Meet <span className="text-indigo-800">TheraBot</span>: Your AI Mental Health Companion
                </h1>
                <p className="mt-4 text-lg italic text-gray-700">
                    A safe space to express, reflect, and heal — anytime, anywhere.
                </p>
                
                <p className="mt-4 text-lg text-gray-800 font-medium">
                    Whether you're feeling overwhelmed, anxious, or just need someone to listen, 
                    <span className="text-indigo-800 font-semibold"> TherBot</span> is here for you.
                </p>

                <button 
                    onClick={scrollToSection} 
                    className="mt-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-lg rounded-full shadow-md transition"
                >
                    💬 Get Start Journey
                </button>
            </section>

            <div className="w-screen md:px-4  max-w-screen-xl mx-auto px-4 overflow-hidden" style={{marginTop: "50px"}}>
                <Slider {...settings} className="w-full">
                    <div className="flex justify-center">
                        <img className="w-full md:w-3/4 lg:w-2/3 xl:w-1/2 h-auto rounded-lg mx-auto" src={carsouel} alt="Slide 1" />
                    </div>
                    <div className="flex justify-center">
                        <img className="w-full w-10 md:w-3/4 lg:w-2/3 xl:w-1/2 h-auto rounded-lg mx-auto" src={carsouel1} alt="Slide 2" />
                    </div>
                    <div className="flex justify-center">
                        <img className="w-full md:w-3/4 lg:w-2/3 xl:w-1/2 h-auto rounded-lg mx-auto" src= {carsouel2}alt="Slide 3" />
                    </div>
                    <div className="flex justify-center">
                        <img className="w-full md:w-3/4 lg:w-2/3 xl:w-1/2 h-auto rounded-lg mx-auto" src= {carsouel3}alt="Slide 4" />
                    </div>
                    <div className="flex justify-center">
                        <img className="w-full md:w-3/4 lg:w-2/3 xl:w-1/2 h-auto rounded-lg mx-auto" src={Carsouel5} alt="Slide 5" />
                    </div>
                </Slider>
            </div>

            {/* Why TherBot? */}
            <section className="why-therbot text-center mt-12 px-6">
                <h2 className="text-3xl font-semibold text-blue-800">Why Choose TherBot?</h2>
                <p className="mt-3 text-gray-700 text-md">
                    Because your mental well-being matters. TherBot is here to:
                </p>
                <ul className="mt-4 list-disc list-inside text-lg text-gray-800">
                    <li>💡 Provide evidence-based mental health support</li>
                    <li>🗣️ Offer a judgment-free listening space</li>
                    <li>🧘 Help with mindfulness, stress, and anxiety</li>
                    <li>🔄 Available anytime — no appointments needed</li>
                </ul>
            </section>

            {/* Testimonials */}
            <section className="testimonials text-center mt-12 px-6 mb-4">
                <h2 className="text-3xl font-semibold text-blue-800">What Users Say</h2>
                <p className="mt-4 text-lg italic text-gray-700">
                    “TherBot feels like a true friend. It helped me manage my anxiety better than I ever imagined.”
                </p>
                <p className="mt-2 text-gray-700">— A grateful user</p>
            </section>

            
        <div ref={sectionRef} className="flex flex-col items-center justify-center text-center p-8 mt-4">
            {/* Header */}
            <h1 className="text-4xl font-bold text-blue-700">
                🧠 Find the Right Support for Your Mental Wellness
            </h1>
            <p className="mt-4 text-lg italic text-gray-700">
                Your Safe Space to Heal, Reflect & Grow
            </p>

            {/* Description */}
            <p className="mt-4 text-lg text-gray-800 font-medium">
                We all have moments when we need someone to listen. Whether you prefer an
                <span className="text-indigo-800 font-semibold"> AI-powered companion </span> 
                for instant support or a
                <span className="text-green-800 font-semibold"> certified therapist </span>
                for personalized guidance, we're here for you.
            </p>

            {/* Button Section */}
            <div className="flex gap-6 mt-6">
                {/* Chatbot Button */}
                <button 
                    onClick={() => navigate("/chatbot")}  
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg rounded-lg shadow-lg transition"
                >
                    🤖 Talk to AI Chatbot
                </button>

                {/* Therapist Button */}
                <button 
                    onClick={() => navigate("/therapist")}  
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold text-lg rounded-lg shadow-lg transition"
                >
                    👨‍⚕️ Connect with a Therapist
                </button>
            </div>

            {/* How It Works Section */}
            <section className="mt-12 px-6">
                <h2 className="text-3xl font-semibold text-blue-800">How It Works?</h2>
                <p className="mt-3 text-gray-700">
                    🌟 <b>AI Chatbot:</b> Get instant, 24/7 support with our AI-powered mental wellness assistant. Share your thoughts freely, anytime.
                </p>
                <p className="mt-2 text-gray-700">
                    💬 <b>Therapist:</b> Book a session with a professional therapist for personalized guidance and in-depth conversations.
                </p>
                <p className="mt-4 text-lg italic text-gray-700">
                    ✨ Your well-being is important. Let’s take a step towards a healthier mind together.
                </p>
            </section>
        </div>

        </>
    );
};

export default LandingPage;

