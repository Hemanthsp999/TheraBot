import { Outlet } from 'react-router-dom';
import './components/css/App.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {
    return (
        <div className="flex flex-col min-h-screen overflow-x-hidden">
            <Navbar />
            <main className="flex-1">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}

export default App;
