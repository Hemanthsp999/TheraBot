import { useState } from "react";
import axios from "axios";

export default function ForgetPassword() {
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [step, setStep] = useState(1);
    const [message, setMessage] = useState("");

    const sendOtp = async () => {
        try {
            const response = await axios.post("http://localhost:8000/api/send-otp/", { email });
            setMessage(response.data.message);
            setStep(2);
        } catch (error) {
            setMessage(error.response?.data?.error || "Error sending OTP");
        }
    };

    const resetPassword = async () => {
        try {
            const response = await axios.post("http://localhost:8000/api/reset-password/", { email, otp, new_password: newPassword });
            setMessage(response.data.message);
            setStep(3);
        } catch (error) {
            setMessage(error.response?.data?.error || "Error resetting password");
        }
    };

    return (
        <div className="mt-30 text-gray-900" style={{fontFamily: "monospace", fontSize: "15px"}}>
        <div className="container text-wrap overflow-x-hidden overflow-y-hidden">
            <div className="card bg-gray-100 rounded-xl">
                {step === 1 && (
                    <div>
                        <h2><b>Forgot Password</b></h2>
                        <input type="email" className="mt-10" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        <button onClick={sendOtp} className="text-gray-100 mb-10">Send OTP</button>
                    </div>
                )}

                {step === 2 && (
                    <div>
                        <h2>Verify OTP</h2>
                        <input type="text" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
                        <input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                        <button onClick={resetPassword}>Reset Password</button>
                    </div>
                )}

                {step === 3 && <h2>{message}</h2>}

                {message && <p className="message">{message}</p>}
            </div>
        </div>
        </div>
    );
}

