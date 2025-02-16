import axios from 'axios';
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom";

const Login = () => {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const navigate = useNavigate();


    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await axios.post("http://127.0.0.1:8000/api/login/",formData);
            alert("Login successful!");
            
            localStorage.setItem("accessToken", response.data.access_token);
            localStorage.setItem("refreshToken", response.data.refresh);
            localStorage.setItem("userEmail", formData.email);
            localStorage.setItem("expiresAt", response.data.expires_at);
            console.log("Access_Token: ", response.data.access_token)
            console.log('Expires_at', response.data.expires_at)

            navigate(response.data.redirect_url)
        }
        catch (error) {
            setError(error.response?.data?.error || "Something went wrong, please try again.");
        };
    }

    return (
        <>
            <div className="text-wrap overflow-x-hidden overflow-y-hidden">
                <form className="max-w-md mx-auto mt-20 text-start" onSubmit={handleSubmit}>
                    <div className="relative z-0 w-full mb-5 group">
                        <input 
                            type="text" 
                            name="email" 
                            value={formData.email} 
                            onChange={handleChange} 
                            className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer" 
                            placeholder=" " 
                            required 
                        />
                        <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transhtmlForm -translate-y-6 scale-75 top-3 -z-10 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Email</label>
                    </div>
                    <div className="relative z-0 w-full mb-5 group">
                        <input 
                            type="password" 
                            name="password" 
                            value={formData.password} 
                            onChange={handleChange} 
                            className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer" 
                            placeholder=" " 
                            required 
                        />
                        <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transhtmlForm -translate-y-6 scale-75 top-3 -z-10 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Password</label>
                    </div>
                    {error && <p className="text-red-500">{error}</p>}
                    <div className="flex flex-col">
                        <button type="submit" className="bg-blue-600 text-white px-4 rounded">Login</button>
                        <p className="text-gray-900 py-2">Don't have an Account? <Link to="/signup"><u> Register here </u></Link></p>
                        <p className="text-gray-900 py-2"><a href="#">Forget Password?</a></p>
                    </div>
                </form>
            </div>
        </>
    );
};

export default Login;

