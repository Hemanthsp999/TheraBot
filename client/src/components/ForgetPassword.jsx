import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../components/css/ForgetPassword.css";

export default function ForgetPassword() {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [otp, setOtp] = useState(["", "", "", ""]);
    const [step, setStep] = useState(1);
    const [timer, setTimer] = useState(30);
    const [canResend, setCanResend] = useState(false);

    // Resend Timer Logic
    useEffect(() => {
        let interval;
        if (step === 2 && timer > 0) {
            interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
        } else if (timer === 0) setCanResend(true);
        return () => clearInterval(interval);
    }, [step, timer]);

    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);
        if (value && index < 3) document.getElementById(`otp-${index + 1}`).focus();
    };

    const resendOtp = () => {
        setTimer(30);
        setCanResend(false);
        // Add your resend API call here
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="text-center mb-6">
                    <h2 className="text-xl font-bold text-slate-900">
                        {step === 1 ? "Reset Password" : "Verify Code"}
                    </h2>
                </div>

                {step === 1 && (
                    <div className="space-y-4">
                        <input type="text" placeholder="Phone Number" className="w-full p-3 border rounded-xl" 
                            onChange={(e) => setPhoneNumber(e.target.value)} />
                        <button onClick={() => setStep(2)} className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700">
                            Send OTP
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        <div className="flex justify-center">
                            {otp.map((d, i) => (
                                <input key={i} id={`otp-${i}`} type="text" className="otp-input" value={d} 
                                    onChange={(e) => handleOtpChange(i, e.target.value)} />
                            ))}
                        </div>
                        
                        <div className="text-center">
                            {canResend ? (
                                <button onClick={resendOtp} className="text-indigo-600 text-sm font-bold underline">Resend OTP</button>
                            ) : (
                                <p className="text-gray-400 text-sm">Resend in {timer}s</p>
                            )}
                        </div>

                        <button onClick={() => setStep(3)} className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-bold">Verify</button>
                    </div>
                )}
            </div>
        </div>
    );
}
