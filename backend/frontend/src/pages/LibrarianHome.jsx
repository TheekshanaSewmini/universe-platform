import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./css/LibrarianHome.css";
import Navbar from "../components/Navbar";

const SECTION_LABELS = {
  UPPER_A_SIDE: "A - Upper Tier",
  A_SIDE: "A - Central Zone",
  BASE_A_SIDE: "A - Lower Tier",
  UPPER_B_SIDE: "B - Upper Tier",
  B_SIDE: "B - Central Zone",
  BASE_B_SIDE: "B - Lower Tier",
};

const SECTION_RENDER_ORDER = [
  "UPPER_A_SIDE",
  "UPPER_B_SIDE",
  "A_SIDE",
  "B_SIDE",
  "BASE_A_SIDE",
  "BASE_B_SIDE",
];

const getSectionLabel = (sectionValue) =>
  SECTION_LABELS[sectionValue] || String(sectionValue || "").replace(/_/g, " ");

export default function LibrarianHome() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [seats, setSeats] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revealed, setRevealed] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, seatsRes, bookingsRes] = await Promise.all([
          api.get("/user/me", { withCredentials: true }),
          api.get("/librarian/seats/all"),
          api.get("/student/booking/all"),
        ]);
        setProfile(profileRes.data);
        setSeats(seatsRes.data);
        setBookings(bookingsRes.data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const intervalId = setInterval(fetchData, 10000);
    return () => clearInterval(intervalId);
  }, []);

  const backendBaseUrl = api.defaults.baseURL || "";
  const toAbsolute = (url) =>
    url ? (url.startsWith("http") ? url : backendBaseUrl + url) : null;
  const profileImageFull = profile?.profileImageUrl
    ? toAbsolute(profile.profileImageUrl)
    : null;

  const totalSeats = seats.length;
  const totalBookings = bookings.length;

  const latestBookings = [...bookings]
    .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
    .slice(0, 4);

  const seatsBySection = seats.reduce((acc, seat) => {
    const section = seat.section || seat.seatSection;
    acc[section] = (acc[section] || 0) + 1;
    return acc;
  }, {});

  const seatBreakdown = SECTION_RENDER_ORDER
    .filter((section) => seatsBySection[section])
    .map((section) => ({
      section: getSectionLabel(section),
      count: seatsBySection[section],
    }));

  const stats = [
    { label: "Total Seats", value: totalSeats, icon: "💺" },
    { label: "Total Bookings", value: totalBookings, icon: "📋" },
  ];

  const formatDateTime = (dateTime) => {
    if (!dateTime) return "N/A";
    const date = new Date(dateTime);
    return date.toLocaleString();
  };

  const toggleReveal = (id) => {
    setRevealed(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="librarian-dashboard">
      <Navbar />

      <div className="dashboard-layout">
        <aside className="dashboard-sidebar">
          {profile && (
            <div className="profile-card">
              <div className="profile-avatar">
                {profileImageFull ? (
                  <img src={profileImageFull} alt="Profile" />
                ) : (
                  <span>
                    {profile.firstname
                      ? profile.firstname[0].toUpperCase()
                      : profile.name?.charAt(0).toUpperCase() || "U"}
                  </span>
                )}
              </div>
              <h3>Welcome, {profile.firstname || profile.name}!</h3>
              <p>
                Role: <strong>{profile.role?.replace("ROLE_", "")}</strong>
              </p>
              <p className="user-email">{profile.email}</p>
              <button
                className="profile-view-btn"
                onClick={() => navigate("/profile")}
              >
                View Profile
              </button>
            </div>
          )}

          <div className="stats-card">
            <h3>Library Overview</h3>
            <div className="stats-list">
              {stats.map((stat, idx) => (
                <div key={idx} className="stat-item">
                  <div className="stat-icon">{stat.icon}</div>
                  <div>
                    <h4>{stat.value}</h4>
                    <p>{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="stats-card">
            <h3>Seats by Section</h3>
            <div className="stats-list">
              {seatBreakdown.length > 0 ? (
                seatBreakdown.map((item, idx) => (
                  <div key={idx} className="stat-item">
                    <div className="stat-icon">📌</div>
                    <div>
                      <h4>{item.section}</h4>
                      <p>{item.count} seats</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-data">No seat data available</p>
              )}
            </div>
          </div>
        </aside>

        <main className="dashboard-main">
          <div className="section-header">
            <h2>Latest Bookings</h2>
            <p>Recent seat reservations</p>
          </div>

          {loading ? (
            <div className="loader">Loading bookings...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : (
            <>
              <div className="insights-card">
                <div className="insight-item">
                  <span className="insight-emoji">📊</span>
                  <div>
                    <h4>{totalBookings}</h4>
                    <p>Total bookings recorded</p>
                  </div>
                </div>
                <div className="insight-item">
                  <span className="insight-emoji">💺</span>
                  <div>
                    <h4>{totalSeats}</h4>
                    <p>Seats across all sections</p>
                  </div>
                </div>
                <div className="insight-item">
                  <span className="insight-emoji">📅</span>
                  <div>
                    <h4>{seatBreakdown.length}</h4>
                    <p>Sections available</p>
                  </div>
                </div>
              </div>

              <div className="bookings-grid">
                {latestBookings.length === 0 ? (
                  <p className="no-data">No bookings found.</p>
                ) : (
                  latestBookings.map((booking) => (
                    <div key={booking.id} className="booking-card">
                      <div className="booking-header">
                        <div className="booking-icon">📖</div>
                        <div>
                          <h4>Seat {booking.seatNumber}</h4>
                          <p className="booking-section">
                            {getSectionLabel(booking.section || booking.seatSection)}
                          </p>
                        </div>
                      </div>
                      <div className="booking-details">
                        <p>
                          <strong>Start:</strong> {formatDateTime(booking.startTime)}
                        </p>
                        <p>
                          <strong>End:</strong> {formatDateTime(booking.endTime)}
                        </p>
                        <p className="passkey-row">
                          <strong>Passkey:</strong>
                          <span className="passkey-toggle" onClick={() => toggleReveal(booking.id)}>
                            {revealed[booking.id] ? (
                              <code className="passkey-display">{booking.passKey}</code>
                            ) : (
                              <span className="passkey-hidden">🔒 Click to reveal</span>
                            )}
                          </span>
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}