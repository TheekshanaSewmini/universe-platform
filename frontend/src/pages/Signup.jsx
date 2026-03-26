import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import api from "../api/axios";
import "./css/Signup.css";

const steps = ["Personal Information", "Account Details"];

export default function Signup() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstname: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
    tempEmail: "",
    role: "ROLE_USER",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setForm(prev => ({ ...prev, phoneNumber: value }));
  };

  const validateStep = (step) => {
    const errors = [];
    if (step === 0) {
      if (!form.firstname.trim()) errors.push("First name cannot be empty!");
      if (!form.lastName.trim()) errors.push("Last name is required!");
      if (!form.email.trim()) errors.push("Please enter your email");
      else if (!/\S+@\S+\.\S+/.test(form.email)) errors.push("Enter a valid email");
    }
    if (step === 1) {
      if (!form.phoneNumber.trim()) errors.push("Phone number is required");
      else if (!/^\d{10}$/.test(form.phoneNumber.trim())) errors.push("Phone number must be exactly 10 digits and contain only numbers");
      if (!form.password.trim()) errors.push("Password cannot be empty");
      else if (form.password.length < 6) errors.push("Password must be at least 6 characters");
    }
    return errors;
  };

  const handleNext = async () => {
    const stepErrors = validateStep(activeStep);
    if (stepErrors.length > 0) {
      stepErrors.forEach(msg => toast.error(msg));
      return;
    }
    if (activeStep === steps.length - 1) handleSubmit();
    else setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (activeStep === 0) {
      navigate("/login");
    } else {
      setActiveStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await api.post("/auth/register", form, { headers: { "Content-Type": "application/json" } });
      if (res.data.success) {
        toast.success("🎉 Registration successful! Redirecting to OTP verification...");
        setTimeout(() => navigate("/verify", { state: { email: form.email } }), 1500);
      } else {
        toast.error(res.data.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <div className="step-content">
            <h3>Personal Information</h3>
            <div className="rows">
              <div className="cols">
                <label>First Name</label>
                <input type="text" name="firstname" value={form.firstname} onChange={handleChange} />
              </div>
              <div className="cols">
                <label>Last Name</label>
                <input type="text" name="lastName" value={form.lastName} onChange={handleChange} />
              </div>
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} />
            </div>
          </div>
        );
      case 1:
        return (
          <div className="step-content">
            <h3>Account Security</h3>
            <div className="form-group">
              <label>Phone Number</label>
              <input type="text" name="phoneNumber" value={form.phoneNumber} onChange={handlePhoneChange} placeholder="10 digit number" />
            </div>
            <div className="form-group">
              <label>Password</label>
              <div className="password-wrapper">
                <input type={showPassword ? "text" : "password"} name="password" value={form.password} onChange={handleChange} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label>Account Type</label>
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="ROLE_USER">Student</option>
                <option value="ROLE_ADMIN">Instructor</option>
                 <option value="ROLE_LIBRARIAN"> ROLE_LIBRARIAN</option>
              </select>
            </div>
            <div className="form-group">
              <label>Alternative Email (Optional)</label>
              <input type="email" name="tempEmail" value={form.tempEmail} onChange={handleChange} />
              <small>For recovery purposes</small>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="signup-page">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="overlay"></div>

      <div className="signup-container">

        <div className="signup-info">
          <h1>UniVerse</h1>
          <p>Connecting students – lost & found, library resources, and more.</p>
          <ul>
            <li>Report lost items or find what you've misplaced</li>
            <li>Check library availability in real‑time</li>
            <li>Connect with fellow students on campus</li>
          </ul>
          <p>Join thousands of students making campus life easier.</p>
        </div>

    
        <div className="signup-card">
          <div className="form-header">
            <h2>Create Your Account</h2>
            <p>Join the future of university connectivity</p>
          </div>

          <div className="stepper">
            {steps.map((label, idx) => (
              <div key={idx} className={`step ${activeStep === idx ? 'active' : ''} ${activeStep > idx ? 'completed' : ''}`}>
                <div className="step-icon">{activeStep > idx ? '✓' : idx + 1}</div>
                <span>{label}</span>
              </div>
            ))}
          </div>

          <div className="step-content-wrapper">
            {renderStepContent(activeStep)}
          </div>

          <div className="form-actionss">
            <button onClick={handleBack} disabled={loading} className="back-btn">Back</button>
            <div>
              <span>Step {activeStep + 1} of {steps.length}</span>
              <button onClick={handleNext} disabled={loading} className="primary-btn">
                {loading ? "⏳ Processing..." : (activeStep === steps.length - 1 ? "Create Account" : "Continue")}
              </button>
            </div>
          </div>
        </div>
      </div>

      <footer>
        © {new Date().getFullYear()} UniVerse. All rights reserved.
      </footer>
    </div>
  );
}