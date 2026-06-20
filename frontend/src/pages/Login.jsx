import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/axios";
import universeLogo from "../assets/universe-logo.png";
import "./css/Login.css";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const errors = [];
    if (!form.email.trim()) errors.push("Email is required");
    else if (!/\S+@\S+\.\S+/.test(form.email)) errors.push("Invalid email address");
    if (!form.password.trim()) errors.push("Password is required");
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (validationErrors.length > 0) {
      validationErrors.forEach(err => toast.error(err));
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await api.post("/auth/login", form, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });

      if (res.data.success) {
        setMessage("Login successful! Redirecting...");
        toast.success("Login successful! Redirecting...");

        setTimeout(() => {
          const role = res.data.role || res.data.user?.role;
          if (role === "ROLE_ADMIN") navigate("/dashboard");
          else if (role === "ROLE_LIBRARIAN") navigate("/librarianhome");
          else navigate("/home");
        }, 1500);
      } else {
        const errMsg = res.data.message || "Login failed. Check credentials.";
        setMessage(errMsg);
        toast.error(errMsg);
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || "Unable to connect to server.";
      setMessage(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page"><div className="login-container">
        <div className="login-info">
          <div className="brand">
            <img src={universeLogo} alt="UniVerse logo" className="brand-logo" />
            <h1>UniVerse</h1>
          </div>
          <p>Connecting students – lost & found, library resources, and more.</p>
          <ul>
            <li>Report lost items or find what you've misplaced</li>
            <li>Check library availability in real‑time</li>
            <li>Connect with fellow students on campus</li>
          </ul>
          <p>Join thousands of students making campus life easier.</p>
        </div>

        <div className="login-card">
          <div className="card-brand">
            <img src={universeLogo} alt="UniVerse logo" className="card-logo" />
            <span>UniVerse</span>
          </div>
          <h2>Welcome Back</h2>
          <p>Sign in to access all features</p>

          {message && (
            <div className={`message ${message.includes("successful") ? "success" : "error"}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="show-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="forgot-password">
              <Link to="/forgot-password">Forgot password?</Link>
            </div>

            <button type="submit" disabled={loading} className="login-btns">
              {loading ? "Loading..." : "Login"}
            </button>
          </form>

          <p className="signup-link">
            New to UniVerse? <Link to="/signup">Sign up</Link>
          </p>
        </div>
      </div>

      <footer>
        © {new Date().getFullYear()} UniVerse. All rights reserved.
      </footer>
    </div>
  );
}





