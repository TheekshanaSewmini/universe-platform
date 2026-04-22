import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";
import universeLogo from "../assets/universe-logo.png";
import educationHero from "../assets/education-hero.png";

export default function LandingPage() {
  const navigate = useNavigate();
  const [privacyOpen, setPrivacyOpen] = useState(false);

  return (
    <div className="landing-page">
      {/* ================= NAVBAR ================= */}
      <nav className="navbar glass">
        <div className="logo" onClick={() => window.scrollTo(0, 0)}>
          <img src={universeLogo} alt="UniVerse logo" className="logo-mark" />
          <span>UniVerse</span>
        </div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#materials">Materials</a>
          <a href="#contact">Contact</a>
          <button className="privacy-link" onClick={() => setPrivacyOpen(true)}>
            Privacy
          </button>
          <button className="login-btn" onClick={() => navigate("/login")}>
            Login
          </button>
        </div>
      </nav>

      <section
        className="hero-section"
        style={{ backgroundImage: `url(${educationHero})` }}
      >
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-text">
            <h1>
              Connect, Share, <span>Thrive</span>
            </h1>
            <p>
              UniVerse brings together lost & found, library availability, student connections,
              and a powerful learning resource hub – all in one smart campus platform.
            </p>
            <button className="cta-btn" onClick={() => navigate("/signup")}>
              Join UniVerse
            </button>
          </div>
        </div>
      </section>

      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {[
              { value: "5K+", label: "Active Students" },
              { value: "200+", label: "Items Found" },
              { value: "98%", label: "Library Satisfaction" },
            ].map((stat, idx) => (
              <div className="stat-card glass" key={idx}>
                <h2>{stat.value}</h2>
                <p>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="features-section">
        <div className="container">
          <h2>Why Choose UniVerse</h2>
          <p>Everything you need for a smarter campus experience</p>
          <div className="features-grid">
            {[
              { icon: "🔍", title: "Lost & Found", desc: "Report lost items or find what you've misplaced – fast." },
              { icon: "📚", title: "Library Availability", desc: "Check real‑time seat availability and reserve study spaces." },
              { icon: "📖", title: "Learning Resources", desc: "Upload and download materials, build your own digital library." },
              { icon: "👥", title: "Student Network", desc: "Connect with peers, ask questions, and share resources." },
              { icon: "✅", title: "Task Manager", desc: "Stay on top of assignments with built‑in task tracking." },
              { icon: "🏆", title: "Achievements", desc: "Earn badges and recognition for active participation." },
            ].map((feature, idx) => (
              <div className="feature-card glass" key={idx}>
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="materials" className="materials-showcase">
        <div className="container">
          <h2>Your Personal Learning Library</h2>
          <p>Upload, organise, and access study materials anytime, anywhere</p>
          <div className="materials-grid">
            <div className="material-card glass">
              <div className="material-icon">📄</div>
              <h3>Upload Notes & PDFs</h3>
              <p>Share your study materials with the community or keep them private.</p>
            </div>
            <div className="material-card glass">
              <div className="material-icon">📚</div>
              <h3>Organise by Course</h3>
              <p>Create courses, subjects, and materials in a structured way.</p>
            </div>
            <div className="material-card glass">
              <div className="material-icon">🔄</div>
              <h3>Version Control</h3>
              <p>Keep track of updates – every version is saved and accessible.</p>
            </div>
            <div className="material-card glass">
              <div className="material-icon">🔒</div>
              <h3>Privacy Controls</h3>
              <p>Choose who can see your materials – public or private.</p>
            </div>
          </div>
          <div className="materials-cta">
            <button className="cta-btn" onClick={() => navigate("/signup")}>
              Explore My Materials
            </button>
          </div>
        </div>
      </section>

      <footer id="contact" className="footer">
        <div className="footer-content">
          <div>
            <h3>UniVerse</h3>
            <p>Smart Campus • Lost & Found • Library Access • Learning Hub</p>
            <p className="copyright">© {new Date().getFullYear()} UniVerse. All rights reserved.</p>
          </div>
          <div className="footer-links">
            <a href="#features">Features</a>
            <a href="#materials">Materials</a>
            <button className="privacy-footer" onClick={() => setPrivacyOpen(true)}>Privacy</button>
          </div>
          <div className="social-links">
            <a href="#">📘</a>
            <a href="#">🐦</a>
            <a href="#">📷</a>
            <a href="#">🔗</a>
          </div>
        </div>
      </footer>


      {privacyOpen && (
        <div className="modal-overlay" onClick={() => setPrivacyOpen(false)}>
          <div className="modal-content glass" onClick={(e) => e.stopPropagation()}>
            <h2>Privacy Policy</h2>
            <p>
              At UniVerse, we take your privacy seriously. We collect only the information necessary
              to provide our services. Your data is never shared with third parties without your consent.
              For full details, please contact our support team.
            </p>
            <button className="modal-close" onClick={() => setPrivacyOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
