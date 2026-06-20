import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/axios";
import "./css/ForgotPassword.css";

const steps = ["Contact", "Verify OTP", "New Password"];

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [form, setForm] = useState({
    email: "",
    tempEmail: "",
    phoneNumber: "",
    otp: "",
    password: "",
    repeatPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateStep = (currentStep) => {
    const newErrors = {};
    if (currentStep === 1) {
      if (!form.email.trim() && !form.phoneNumber.trim())
        newErrors.email = "Email or phone required";
      if (form.email && !/\S+@\S+\.\S+/.test(form.email))
        newErrors.email = "Invalid email";
    } else if (currentStep === 2) {
      if (!form.otp.trim()) newErrors.otp = "OTP required";
      else if (!/^\d{6}$/.test(form.otp)) newErrors.otp = "OTP must be 6 digits";
    } else if (currentStep === 3) {
      if (!form.password.trim()) newErrors.password = "Password required";
      else if (form.password.length < 8) newErrors.password = "Minimum 8 characters";
      if (!form.repeatPassword.trim()) newErrors.repeatPassword = "Confirm password";
      else if (form.password !== form.repeatPassword) newErrors.repeatPassword = "Passwords do not match";
    }
    return newErrors;
  };

  const startOtpTimer = () => {
    setOtpTimer(60);
    const timer = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async () => {
    const errs = validateStep(1);
    if (Object.keys(errs).length) {
      Object.values(errs).forEach((msg) => toast.error(msg));
      return setErrors(errs);
    }
    setLoading(true);
    setMessage("");
    try {
      const res = await api.post("/forgotpass/send-otp", form, { withCredentials: true });
      setMessage(res.data.message || "OTP sent!");
      toast.success(res.data.message || "OTP sent!");
      startOtpTimer();
      setStep(2);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to send OTP";
      setMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const errs = validateStep(2);
    if (Object.keys(errs).length) {
      Object.values(errs).forEach((msg) => toast.error(msg));
      return setErrors(errs);
    }
    setLoading(true);
    try {
      const res = await api.post("/forgotpass/verify-otp", { otp: form.otp }, { withCredentials: true });
      const msg = res.data.message || "OTP verified";
      setMessage(msg);
      toast.success(msg);
      setStep(3);
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid OTP";
      setMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const res = await api.post("/forgotpass/resend-otp", {}, { withCredentials: true });
      const msg = res.data.message || "OTP resent";
      setMessage(msg);
      toast.success(msg);
      startOtpTimer();
    } catch (err) {
      const msg = err.response?.data?.message || "Resend failed";
      setMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    const errs = validateStep(3);
    if (Object.keys(errs).length) {
      Object.values(errs).forEach((msg) => toast.error(msg));
      return setErrors(errs);
    }
    setLoading(true);
    try {
      const res = await api.post("/forgotpass/change-password", form, { withCredentials: true });
      const msg = res.data.message || "Password changed!";
      setMessage(msg);
      toast.success(msg);
      setTimeout(() => navigate("/login", { state: { message: "Password reset successful" } }), 2000);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to change password";
      setMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-page"><div className="forgot-overlay"></div>

      <div className="forgot-container">
        <div className="forgot-info">
          <h1>UniVerse</h1>
          <p>Connecting students – lost & found, library resources, and more.</p>
          <ul>
            <li>Report lost items or find what you've misplaced</li>
            <li>Check library availability in real‑time</li>
            <li>Connect with fellow students on campus</li>
          </ul>
          <p>Join thousands of students making campus life easier.</p>
        </div>

        <div className="forgot-card">
          <div className="forgot-header">
            <h2>Reset Password</h2>
            <p>Step {step} of 3: {steps[step - 1]}</p>
          </div>

          <div className="reset-stepper">
            {steps.map((label, idx) => (
              <div key={idx} className={`reset-step ${step === idx + 1 ? 'active' : ''} ${step > idx + 1 ? 'completed' : ''}`}>
                <div className="step-icon">{step > idx + 1 ? '✓' : idx + 1}</div>
                <span>{label}</span>
              </div>
            ))}
          </div>

          <div className="reset-step-content">
            {step === 1 && (
              <div className="step-panel">
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} />
                  {errors.email && <span className="error-text">{errors.email}</span>}
                </div>
                <div className="form-group">
                  <label>Alternative Email (Optional)</label>
                  <input type="email" name="tempEmail" value={form.tempEmail} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="text" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="step-panel">
                <div className="form-group">
                  <label>OTP (6 digits)</label>
                  <input type="text" name="otp" value={form.otp} onChange={handleChange} maxLength={6} />
                  {errors.otp && <span className="error-text">{errors.otp}</span>}
                </div>
                <div className="otp-controls">
                  <button onClick={handleResendOtp} disabled={otpTimer > 0 || loading} className="resend-btn">
                    {otpTimer > 0 ? `Resend in ${otpTimer}s` : "Resend OTP"}
                  </button>
                  <span>Sent to {form.email || form.phoneNumber}</span>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="step-panel">
                <div className="form-group">
                  <label>New Password</label>
                  <div className="password-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  {errors.password && <span className="error-text">{errors.password}</span>}
                </div>
                <div className="form-group">
                  <label>Confirm Password</label>
                  <div className="password-wrapper">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="repeatPassword"
                      value={form.repeatPassword}
                      onChange={handleChange}
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      {showConfirmPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  {errors.repeatPassword && <span className="error-text">{errors.repeatPassword}</span>}
                </div>
              </div>
            )}
          </div>

          <div className="reset-actions">
            <button onClick={() => (step === 1 ? navigate("/login") : setStep(step - 1))} disabled={loading} className="secondary-btn">
              {step === 1 ? "Back to Login" : "Back"}
            </button>
            <button
              onClick={step === 1 ? handleSendOtp : step === 2 ? handleVerifyOtp : handleChangePassword}
              disabled={loading}
              className="primary-btn"
            >
              {loading ? "Processing..." : step === 1 ? "Send OTP" : step === 2 ? "Verify" : "Reset Password"}
            </button>
          </div>

          <p className="reset-login-link">
            Remember your password? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>

      <footer>
        © {new Date().getFullYear()} UniVerse. All rights reserved.
      </footer>
    </div>
  );
}




