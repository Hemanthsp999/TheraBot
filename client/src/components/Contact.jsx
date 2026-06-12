import { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

const Contact = () => {
    useEffect(() => {
        AOS.init({ duration: 1000, once: true });
    }, []);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        feedbackType: 'General Inquiry', // New field
        subject: '',
        message: ''
    });

    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        // ... (Keep your existing validation logic)
        setSubmitted(true);
        setFormData({ name: '', email: '', feedbackType: 'General Inquiry', subject: '', message: '' });
        setTimeout(() => setSubmitted(false), 5000);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-h-screen bg-gray-50 py-16 px-4">
            <div className="max-w-3xl mx-auto" data-aos="fade-up">
                <h1 className="text-4xl font-extrabold text-blue-900 mb-2 text-center">Get in Touch</h1>
                <p className="text-gray-600 text-center mb-10">We'd love to hear your feedback or help with any inquiries.</p>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12">
                    {submitted && (
                        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl text-center font-medium">
                            Thank you! Your message has been sent successfully.
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <InputField label="Name" name="name" value={formData.name} onChange={handleChange} />
                            <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Feedback Category</label>
                            <select name="feedbackType" value={formData.feedbackType} onChange={handleChange} 
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition">
                                <option>General Inquiry</option>
                                <option>Feature Request</option>
                                <option>Bug Report</option>
                                <option>Clinical Feedback</option>
                            </select>
                        </div>

                        <InputField label="Subject" name="subject" value={formData.subject} onChange={handleChange} />
                        
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                            <textarea name="message" value={formData.message} onChange={handleChange} rows="4"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" />
                        </div>

                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02]">
                            Send Message
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

// Helper component for cleaner code
const InputField = ({ label, name, type = "text", value, onChange }) => (
    <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
        <input type={type} name={name} value={value} onChange={onChange} required
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" />
    </div>
);

export default Contact;
