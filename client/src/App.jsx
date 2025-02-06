import { Outlet } from 'react-router-dom';
import './components/css/App.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow pt-20 pb-32">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}

export default App;
