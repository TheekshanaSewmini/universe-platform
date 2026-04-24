import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../api/axios";
import "./MyFoundItems.css";
import Navbar from "../components/Navbar";

export default function MyLostItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const backendBaseUrl = api.defaults.baseURL || "";
  const toAbsolute = (url) =>
    url ? (url.startsWith("http") ? url : backendBaseUrl + url) : null;

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await api.get("/lostfound/lost/me");
        setItems(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed  to load items");
        toast.error("Could not load your lost items");
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const handleView = (id) => navigate(`/lost-item/${id}`);

  return (
    <div className="my-lost-page">
      <ToastContainer position="top-right" autoClose={3000} />
      <Navbar />
      <div className="container">
        <div className="page-header">
          <h1>My Lost Items</h1>
          <p>Items you have reported as lost</p>
        </div>
        {loading ? (
          <div className="loading-spinner">Loading...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : items.length === 0 ? (
          <div className="no-items">
            <p>You haven't reported any lost items yet.</p>
            <button className="add-btn" onClick={() => navigate("/add-lost")}>
              Report a Lost Item
            </button>
          </div>
        ) : (
          <div className="items-grid">
            {items.map(item => (
              <div key={item.id} className="item-card">
                <div className="item-image">
                  {item.imageUrl ? (
                    <img src={toAbsolute(item.imageUrl)} alt={item.itemName} />
                  ) : (
                    <div className="no-image">📷</div>
                  )}
                </div>
                <div className="item-info">
                  <h3>{item.itemName}</h3>
                  <p className="location">📍 {item.lostPlace}</p>
                  <p className="publisher">👤 {item.contactName}</p>
                  <button className="view-btn" onClick={() => handleView(item.id)}>
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}