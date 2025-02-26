import { useNavigate } from 'react-router-dom';

const AccessAccount = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12" data-aos="fade-up">
          <h1 className="text-4xl font-bold text-black mb-4">Welcome to TheraBot</h1>
          <p className="text-gray-700 text-lg max-w-2xl mx-auto">
            Choose your account type to access personalized mental health support. 
            Whether you're seeking help or providing professional care, we're here to connect you.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* User Access Card */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300" data-aos="fade-right">
            <div className="p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold text-black mb-3">User Account</h2>
                <p className="text-gray-600 mb-4">Access your personal mental wellness journey</p>
                <ul className="text-left text-gray-600 mb-6 space-y-2">
                  <li>• Connect with AI therapy assistant</li>
                  <li>• Book sessions with therapists</li>
                  <li>• Track your wellness journey</li>
                  <li>• Access support resources</li>
                </ul>
              </div>
              <button
                onClick={() => navigate('/login')}
                                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 shadow-lg transition-colors duration-100 tansform hover:shadow-2xl hover:scale-105"
              >
                Login as User
              </button>
            </div>
          </div>

          {/* Therapist Access Card */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300" data-aos="fade-left">
            <div className="p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold text-black mb-3">Therapist Account</h2>
                <p className="text-gray-600 mb-4">Access your professional dashboard</p>
                <ul className="text-left text-gray-600 mb-6 space-y-2">
                  <li>• Manage patient appointments</li>
                  <li>• Access session tools</li>
                  <li>• View patient progress</li>
                  <li>• Professional resources</li>
                </ul>
              </div>
              <button
                onClick={() => navigate('/therapist-login')}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors duration-100 tansform hover:shadow-2xl hover:scale-105"
              >
                Login as Therapist
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessAccount; 
