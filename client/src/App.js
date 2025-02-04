import { Outlet, useNavigate } from 'react-router-dom';
import './components/css/App.css';
import Navbar from './components/Navbar.js';
import Footer from './components/Footer.js';

function App() {
    const navigate = useNavigate();
    return (
        <div className="app-container">
            <Navbar />
              {/* Hero Section */}
            <center>
            <section className=" mt-3 hero text-lg">
                <h1> Meet TheraBot: Your AI Mental Health Companion</h1>
                <p> Your safe space to express, reflect and heal - anytime, anywhere.</p>
            </section>
            </center>
            
            
            <div className="content">
                <Outlet />
            </div>
            <Footer />
        </div>
    );
}

export default App;

