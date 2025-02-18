import { useState } from 'react';
import { Link } from 'react-router-dom';

const TherapistLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    licenseNumber: '' // Additional field for therapists
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Here you would typically send the data to your backend
      console.log('Therapist login attempt:', formData);
      
      // Add your therapist login logic here
      // navigate('/therapist-dashboard'); // After successful login
    } catch (err) {
      setError('Login failed. Please check your credentials.', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-40 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Therapist Login</h1>
          <p className="text-gray-600">Welcome back, please login to your professional account</p>
        </div>

<div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl  duration-100 transform hover:scale-105">


          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-black font-medium mb-2" htmlFor="email">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-black"
                required
              />
            </div>

            <div>
              <label className="block text-black font-medium mb-2" htmlFor="licenseNumber">
                License Number
              </label>
              <input
                type="text"
                id="licenseNumber"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-black"
                required
              />
            </div>

            <div>
              <label className="block text-black font-medium mb-2" htmlFor="password">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-black"
                required
              />
            </div>

            {error && (
              <div className="text-red-500 text-center">{error}</div>
            )}

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors duration-300"
            >
              Login
            </button>

            <div className="text-center text-gray-600">
              <p>Need help? <Link to="/contact" className="text-green-600 hover:underline">Contact Support</Link></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TherapistLogin; 
