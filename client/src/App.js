import { Outlet, useNavigate } from 'react-router-dom';
import './components/css/App.css';
import Navbar from './components/Navbar.js';
import Footer from './components/Footer.js';
//import LandingPage from './components/Landingpage.js';

function App() {
    //const navigate = useNavigate();
    return (
        <div className="app-container scroll-smooth">
            <Navbar />

             <div className="content">
                <Outlet />
            </div>
            
            <div className="bottom">
            <Footer />
            </div>
        </div>
    );
}

export default App;

