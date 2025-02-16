import { Outlet } from 'react-router-dom';
import './components/css/App.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AutoLogout from './components/AutoLogout'; // Fixed import name

function App() {
    return (
        <div className="flex flex-col min-h-screen overflow-x-hidden">
            <Navbar />
            <main className="flex-1">
                <AutoLogout />  {/* Fixed component casing */}
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}

export default App;

