import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function ForgetPassword() {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [otp, setOtp] = useState(["", "", "", ""]);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [step, setStep] = useState(1);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handlePhoneChange = (e) => {
        // Only allow numbers
        const value = e.target.value.replace(/\D/g, "");
        setPhoneNumber(value);
    };

    const handleOtpChange = (index, value) => {
        // Only allow single digit
        if (value.length > 1) value = value.slice(0, 1);
        
        // Update the OTP array
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        
        // Auto-focus to next input
        if (value && index < 3) {
            document.getElementById(`otp-input-${index + 1}`).focus();
        }
    };

    const sendOtp = async () => {
        if (!phoneNumber || phoneNumber.length < 10) {
            setMessage("Please enter a valid phone number");
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post("http://localhost:8000/api/send-otp/", { phone_number: phoneNumber });
            setMessage(response.data.message || "OTP sent successfully!");
            setStep(2);
        } catch (error) {
            setMessage(error.response?.data?.error || "Error sending OTP");
        } finally {
            setLoading(false);
        }
    };

    const resetPassword = async () => {
        const otpString = otp.join("");
        if (otpString.length !== 4) {
            setMessage("Please enter the complete OTP");
            return;
        }

        if (!newPassword) {
            setMessage("Please enter a new password");
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage("Passwords don't match");
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post("http://localhost:8000/api/reset-password/", { 
                phone_number: phoneNumber, 
                otp: otpString, 
                new_password: newPassword 
            });
            setMessage(response.data.message || "Password reset successful!");
            setStep(3);
            
            // Redirect to login after success
            setTimeout(() => {
                navigate("/login");
            }, 3000);
        } catch (error) {
            setMessage(error.response?.data?.error || "Error resetting password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        {step === 1 ? "Reset Your Password" : step === 2 ? "Verify OTP" : "Success"}
                    </h2>
                </div>
                
                <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {step === 1 && (
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-black">
                                    Phone Number
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        required
                                        className="appearance-none text-black block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        placeholder="Enter your phone number"
                                        value={phoneNumber}
                                        onChange={handlePhoneChange}
                                        maxLength={10}
                                    />
                                </div>
                            </div>

                            <div>
                                <button
                                    type="button"
                                    onClick={sendOtp}
                                    disabled={loading}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                >
                                    {loading ? "Sending..." : "Send OTP"}
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Enter OTP sent to {phoneNumber}
                                </label>
                                <div className="flex justify-between space-x-2 text-black">
                                    {[0, 1, 2, 3].map((index) => (
                                        <input
                                            key={index}
                                            id={`otp-input-${index}`}
                                            type="text"
                                            className="w-16 h-16 text-center text-2xl border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            maxLength={1}
                                            value={otp[index]}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    New Password
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        placeholder="Enter new password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                    Confirm Password
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        required
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        placeholder="Confirm new password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="text-sm text-blue-600 hover:text-blue-500"
                                >
                                    Back
                                </button>
                                <button
                                    type="button"
                                    onClick={resetPassword}
                                    disabled={loading}
                                    className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                >
                                    {loading ? "Resetting..." : "Reset Password"}
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="text-center py-4">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="mt-2 text-lg font-medium text-gray-900">Password Reset Successful</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Redirecting to login...
                            </p>
                        </div>
                    )}

                    {message && (
                        <div className={`mt-4 text-sm ${message.includes("Error") ? "text-red-600" : "text-green-600"}`}>
                            {message}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
