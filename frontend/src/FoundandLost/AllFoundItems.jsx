import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../api/axios";
import "./AllFoundItems.css";
import Navbar from "../components/Navbar";

export default function AllFoundItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const backendBaseUrl = api.defaults.baseURL || "";
  const toAbsolute = (url) =>
    url ? (url.startsWith("http") ? url : backendBaseUrl + url) : null;

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await api.get("/lostfound/found");
        setItems(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load items");
        toast.error("Could not load found items");
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const handleViewDetails = async (id) => {
    try {
      const res = await api.get(`/lostfound/found/${id}`);
      setSelectedItem(res.data);
      setShowModal(true);
    } catch (err) {
      toast.error("Failed to load item details");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  const filteredItems = items.filter(item => {
    const name = item.itemName?.toLowerCase() || "";
    const place = item.foundPlace?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();
    return name.includes(search) || place.includes(search);
  });

  return (
    <div className="all-found-page">
      <ToastContainer position="top-right" autoClose={3000} />
      <Navbar />
      <div className="container">
        <div className="page-header">
          <h1>All Found Items</h1>
          <p>Browse items reported as found</p>
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by item name or place..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>
          <div className="action-buttons">
            <button className="my-found-btn" onClick={() => navigate("/my-found")}>
              📋 My Found Items
            </button>
            <button className="add-found-btn" onClick={() => navigate("/add-found")}>
              + Report Found Item
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-spinner">Loading items...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : filteredItems.length === 0 ? (
          <div className="no-items">
            <p>No found items yet.</p>
            <button className="add-btn" onClick={() => navigate("/add-found")}>
              Report a Found Item
            </button>
          </div>
        ) : (
          <div className="items-grid">
            {filteredItems.map(item => (
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
                  <button className="view-btn" onClick={() => handleViewDetails(item.id)}>
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

 
      {showModal && selectedItem && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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
              <p className="semester">
                📅 {selectedItem.year} – {selectedItem.semester}
              </p>
              <p className="description">{selectedItem.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}