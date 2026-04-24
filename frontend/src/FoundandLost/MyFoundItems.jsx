import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../api/axios";
import "./MyFoundItems.css";
import Navbar from "../components/Navbar";

export default function MyFoundItems() {
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
        const res = await api.get("/lostfound/found/me");
        setItems(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed  to load items");
        toast.error("Could not load your found items");
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const handleView = (id) => navigate(`/found-item/${id}`);

  return (
    <div className="my-found-page">
      <ToastContainer position="top-right" autoClose={3000} />
      <Navbar />
      <div className="container">
        <div className="page-header">
          <h1>My Found Items</h1>
          <p>Items you have reported as found</p>
        </div>
        {loading ? (
          <div className="loading-spinner">Loading...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : items.length === 0 ? (
          <div className="no-items">
            <p>You haven't reported any found items yet.</p>
            <button className="add-btn" onClick={() => navigate("/add-found")}>
              Report a Found Item
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
                  <p className="location">📍 {item.foundPlace}</p>
                  <p className="publisher">👤 {item.publisherName}</p>
                  <p className="description">{item.description?.slice(0, 80)}...</p>
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