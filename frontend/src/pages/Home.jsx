import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import "./css/Home.css";

export default function Home() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [foundItems, setFoundItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, foundRes] = await Promise.all([
          api.get("/user/me", { withCredentials: true }),
          api.get("/lostfound/found"),
        ]);
        setUser(userRes.data);
        // Sort by foundDate descending (newest first) if available, else by id
        const sorted = [...foundRes.data].sort((a, b) => {
          const aTime = a.foundDate ? new Date(a.foundDate) : a.createdAt ? new Date(a.createdAt) : a.id;
          const bTime = b.foundDate ? new Date(b.foundDate) : b.createdAt ? new Date(b.createdAt) : b.id;
          return bTime - aTime;
        });
        setFoundItems(sorted.slice(0, 4));
      } catch (err) {
        console.error(err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          navigate("/login");
        } else {
          setError(err.response?.data?.message || "Failed to load data");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const backendBaseUrl = api.defaults.baseURL || "";
  const toAbsolute = (url) =>
    url ? (url.startsWith("http") ? url : backendBaseUrl + url) : null;

  const profileImageFull = user?.profileImageUrl
    ? toAbsolute(user.profileImageUrl)
    : null;

  const handleItemClick = async (id) => {
    try {
      const res = await api.get(`/lostfound/found/${id}`);
      setSelectedItem(res.data);
      setShowModal(true);
    } catch (err) {
      console.error(err);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "Invalid date" : date.toLocaleDateString();
  };

  if (error) return <p className="error-message">{error}</p>;
  if (loading) return <p className="loading-spinner">Loading...</p>;

  return (
    <div className="user-dashboard">
      <Navbar />

      <div className="dashboard-layout">
        <aside className="dashboard-sidebar">
          <div className="profile-card">
            <div className="profile-avatar">
              {profileImageFull ? (
                <img src={profileImageFull} alt="Profile" />
              ) : (
                <span>{user.firstname ? user.firstname[0].toUpperCase() : "U"}</span>
              )}
            </div>
            <h3>Welcome, {user.firstname || user.name}!</h3>
            <p>Role: <strong>{user.role.replace("ROLE_", "")}</strong></p>
            <p className="user-email">{user.email}</p>
            <button className="profile-view-btn" onClick={() => navigate("/profile")}>
              View Profile
            </button>
          </div>

          <div className="quick-links">
            <h4>Quick Actions</h4>
            <button className="quick-link-btn" onClick={() => navigate("/materials/my")}>
              📚 Study Materials
            </button>
            <button className="quick-link-btn" onClick={() => navigate("/checkAvailability")}>
              🔍  Check Booking Availability
            </button>
            <button className="quick-link-btn" onClick={() => navigate("/seatAvailability")}>
              🪑 Seat Booking Availability
            </button>
            <button className="quick-link-btn" onClick={() => navigate("/suggest")}>
              🕵️‍♂️ Quickly view Lost suggest
            </button>
          </div>
        </aside>

        <main className="dashboard-main">
          <div className="welcome-message">
            <p>Stay connected with your campus. Find lost items, report found belongings, and check library availability anytime.</p>
          </div>

          {foundItems.length > 0 && (
            <div className="section-card">
              <h3>Latest Found Items</h3>
              <div className="items-grid">
                {foundItems.map(item => (
                  <div
                    key={item.id}
                    className="item-card"
                    onClick={() => handleItemClick(item.id)}
                  >
                    <div className="item-image">
                      {item.imageUrl ? (
                        <img src={toAbsolute(item.imageUrl)} alt={item.itemName} />
                      ) : (
                        <div className="no-image">📷</div>
                      )}
                    </div>
                    <div className="item-info">
                      <h4>{item.itemName}</h4>
                      <p className="location">📍 {item.foundPlace}</p>
                      <p className="date">📅 {formatDate(item.foundDate)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {showModal && selectedItem && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>×</button>
            <div className="modal-image">
              {selectedItem.imageUrl ? (
                <img src={toAbsolute(selectedItem.imageUrl)} alt={selectedItem.itemName} />
              ) : (
                <div className="no-image">📷</div>
              )}
            </div>
            <div className="modal-info">
              <h2>{selectedItem.itemName}</h2>
              <p className="location">📍 {selectedItem.foundPlace}</p>
              <p className="publisher">👤 {selectedItem.publisherName}</p>
              <p className="contact">📞 {selectedItem.contactPhone || "Not provided"}</p>
              <p className="date-found">📅 Found: {formatDate(selectedItem.foundDate)}</p>
              <p className="semester">🎓 {selectedItem.year} – {selectedItem.semester}</p>
              <p className="description">{selectedItem.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}