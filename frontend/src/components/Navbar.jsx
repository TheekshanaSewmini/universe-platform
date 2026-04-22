import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";
import universeLogo from "../assets/universe-logo.png";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState(null);

  // Fetch user role
  useEffect(() => {
    api.get("user/me")
      .then((res) => setRole(res.data.role))
      .catch(() => setRole(null));
  }, []);

  const navConfig = {
    ROLE_LIBRARIAN: [
      { label: "Home", path: "/librarianhome" },
      { label: "Add Seat", path: "/sddSeat" },
      { label: "All Seats", path: "/seatsPage" },
      { label: "All Bookings", path: "/all-bookings" },
    ],
    ROLE_USER: [
      { label: "Home", path: "/home" },
      { label: "View Lost Section", path: "/all-lost" },
      { label: "View Found Section", path: "/found-items" },
      { label: "View Booking Section", path: "/userSeats" },
      { label: "materials Section", path: "/materials/all" },
    ],
  };

  const navItems = navConfig[role] || [];

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      navigate("/login");
      alert("Logout successful ✅");
    }
  };



  return (
    <nav className="navbar glass custom-navbar-size">
      <div className="logo only-logo" style={{paddingLeft: '0.5rem'}} onClick={() => navigate(role === "ROLE_LIBRARIAN" ? "/librarianhome" : "/home") }>
        <img src={universeLogo} alt="UniVerse logo" className="logo-mark custom-logo-size" style={{width: '60px', height: '60px', borderRadius: '16px', boxShadow: '0 4px 16px rgba(185,127,68,0.10)'}} />
      </div>
      <div className="nav-links">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <span
              key={item.label}
              className={`nav-link-btn${isActive ? ' nav-link-active' : ''}`}
              style={{ background: "none", border: "none", fontWeight: 500, color: "var(--text-dark)", cursor: "pointer", fontSize: "1rem" }}
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </span>
          );
        })}
        {role && (
          <button
            className="login-btn"
            onClick={handleLogout}
            style={{ marginLeft: "2rem", fontWeight: 700, color: "#9b6a3a", border: "1.5px solid #b97f44", background: "transparent", borderRadius: "30px", padding: "0.4rem 1.5rem", fontSize: "1.1rem" }}
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
