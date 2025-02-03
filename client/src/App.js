import './components/css/App.css';
import Navbar from './components/Navbar.js';
import Footer from './components/Footer.js';

function App() {
    return (
        <>
            <div className="App">
                <Navbar/>
            </div>
            <div className="App">
                <Footer/>
            </div>
        </>
    );
}

export default App;
