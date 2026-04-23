import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
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
  const toTime = (item) => {
    const raw =
      item?.createdAt ??
      item?.created_at ??
      item?.reportedAt ??
      item?.reported_at ??
      item?.foundDate ??
      item?.lostDate;
    const time = raw ? new Date(raw).getTime() : Number.NaN;
    if (!Number.isNaN(time)) return time;
    const idValue = Number(item?.id);
    return Number.isNaN(idValue) ? 0 : idValue;
  };
  const sortByDateDesc = (list) =>
    [...list].sort((a, b) => toTime(b) - toTime(a));

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await api.get("/lostfound/found/me");
        setItems(sortByDateDesc(res.data || []));
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load items");
        toast.error("Could not load your found items");
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const handleView = (id) => navigate(`/found-item/${id}`);

  return (
    <div className="my-found-page"><Navbar />
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
            {items.map((item, index) => (
              <div key={item.id} className="item-card">
                {index < 2 && <span className="new-badge">HOT</span>}
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
                  <p className="date">📅 {new Date(item.foundDate).toLocaleDateString()}</p>
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





