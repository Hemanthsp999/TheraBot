import { Outlet, useNavigate } from 'react-router-dom';
import './components/css/App.css';
import Navbar from './components/Navbar.js';
import Footer from './components/Footer.js';
import LandingPage from './components/Landingpage.js';

function App() {
    const navigate = useNavigate();
    return (
        <div className="app-container scroll-smooth">
            <Navbar />
            
            {/* Hero Section */}
            <section className="hero text-center mt-10 px-6 animate-fadeInDown">
                <h1 className="text-4xl font-bold text-blue-700">
                    🤖 Meet <span className="text-indigo-800">TherBot</span>: Your AI Mental Health Companion
                </h1>
                <p className="mt-4 text-xl italic text-gray-700">
                    A safe space to express, reflect, and heal — anytime, anywhere.
                </p>
                
                <p className="mt-4 text-xl text-gray-800 font-medium">
                    Whether you're feeling overwhelmed, anxious, or just need someone to listen, 
                    <span className="text-indigo-800 font-semibold"> TherBot</span> is here for you.
                </p>

                <button 
                    onClick={() => navigate("/home")} 
                    className="mt-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-lg rounded-full shadow-md transition"
                >
                    💬 Get Start Journey
                </button>
            </section>
            <LandingPage/>

            {/* Why TherBot? */}
            <section className="why-therbot text-center mt-12 px-6">
                <h2 className="text-3xl font-semibold text-blue-800">Why Choose TherBot?</h2>
                <p className="mt-3 text-gray-700">
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

            <div className="content">
                <Outlet />
            </div>
            
            <Footer />
        </div>
    );
}

export default App;

