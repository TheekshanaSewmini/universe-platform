import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";

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

  // Show logout only on /home and librarianhome
  const shouldShowLogout = location.pathname === "/home" || location.pathname === "/librarianhome";

  return (
    <nav className="dashboard-nav">
      <div className="nav-brand">
        <h2 className="logo">UniVerse</h2>
      </div>

      <div className="nav-links">
        {navItems.map((item) => (
          <button
            key={item.label}
            className="nav-link-btn"
            onClick={() => navigate(item.path)}
          >
            {item.label}
          </button>
        ))}

        {role && shouldShowLogout && (
          <button className="nav-link-btn" onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}