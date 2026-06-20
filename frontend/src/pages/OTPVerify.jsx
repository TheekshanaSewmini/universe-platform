import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/axios";
import "./css/OTPVerify.css";

export default function OTPVerify() {
    const navigate = useNavigate();
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);

    const toMessage = (data) => {
        if (!data) return "Something went wrong";
        if (typeof data === "string") return data;
        if (data?.message) return data.message;
        if (data?.error) return data.error;
        return "Something went wrong";
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        if (!otp.trim()) {
            toast.error("OTP is required", { position: "top-right" });
            return;
        }

        try {
            setLoading(true);
            const res = await api.post(
                "/auth/verify-code",
                { verifyCode: otp },
                { withCredentials: true }
            );

            const msg = toMessage(res.data);

            if (res.data.success) {
                toast.success(msg || "OTP verified successfully! 🎉", { position: "top-right" });
                setTimeout(() => {
                    window.location.href = "/login";
                }, 1500);
            } else {
                toast.error(msg, { position: "top-right" });
            }
        } catch (err) {
            console.error(err.response?.data || err);
            toast.error(toMessage(err.response?.data), { position: "top-right" });
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        try {
            setLoading(true);
            const res = await api.post(
                "/auth/resend-otp",
                {},
                { withCredentials: true }
            );
            toast.info(toMessage(res.data) || "OTP resent successfully! ✨", { position: "top-right" });
        } catch (err) {
            console.error(err.response?.data || err);
            toast.error(toMessage(err.response?.data), { position: "top-right" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="otp-verification-page"><div className="verification-overlay"></div>

            <div className="verification-container">
                <div className="verification-info">
                    <h1>UniVerse</h1>
                    <p>Connecting students – lost & found, library resources, and more.</p>
                    <ul>
                        <li>Report lost items or find what you've misplaced</li>
                        <li>Check library availability in real‑time</li>
                        <li>Connect with fellow students on campus</li>
                    </ul>
                    <p>Join thousands of students making campus life easier.</p>
                </div>

             
                <div className="verification-card">
                    <div className="verification-header">
                        <h2>Verify Your Email</h2>
                        <p>Enter the 6‑digit code sent to your email</p>
                    </div>

                    <form onSubmit={handleVerify} className="verification-form">
                        <div className="verification-input-group">
                            <label>OTP Code</label>
                            <input
                                type="text"
                                name="otp"
                                placeholder="Enter OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                maxLength={6}
                                autoComplete="off"
                            />
                        </div>
                        <button type="submit" disabled={loading} className="verify-submit-btn">
                            {loading ? "Verifying..." : "Verify OTP"}
                        </button>
                    </form>

                    <div className="resend-section">
                        <p>Didn't receive the code?</p>
                        <button onClick={handleResend} disabled={loading} className="resend-button">
                            {loading ? "Sending..." : "Resend OTP"}
                        </button>
                    </div>

                    <div className="back-to-login">
                        <button onClick={() => navigate("/login")} className="back-to-login-btn">
                            ← Back to Login
                        </button>
                    </div>
                </div>
            </div>

            <footer className="verification-footer">
                © {new Date().getFullYear()} UniVerse. All rights reserved.
            </footer>
        </div>
    );
}




