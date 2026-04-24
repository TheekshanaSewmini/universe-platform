import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import api from "../api/axios";
import Navbar from "../components/Navbar";
import "./AllFoundItems.css";

export default function AllFoundItems() {
  const [foundItems, setFoundItems] = useState([]);
  const [selectedFoundItem, setSelectedFoundItem] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState("");

  const navigate = useNavigate();
  const baseUrl = api.defaults.baseURL || "";

  useEffect(() => {
    loadFoundItems();
  }, []);

  const getFullImageUrl = (url) => {
    if (!url) return null;
    return url.startsWith("http") ? url : `${baseUrl}${url}`;
  };

  const loadFoundItems = async () => {
    try {
      const { data } = await api.get("/lostfound/found");
      setFoundItems(data);
    } catch (error) {
      setErrorText(error.response?.data?.message || "Failed  to load items");
      toast.error("Could not load found items");
    } finally {
      setLoading(false);
    }
  };

  const openDetails = async (itemId) => {
    try {
      const { data } = await api.get(`/lostfound/found/${itemId}`);
      setSelectedFoundItem(data);
    } catch {
      toast.error("Failed to load item details");
    }
  };

  const closeDetails = () => {
    setSelectedFoundItem(null);
  };

  const visibleItems = useMemo(() => {
    const searchValue = keyword.toLowerCase();

    return foundItems.filter((item) => {
      const itemName = item.itemName?.toLowerCase() || "";
      const place = item.foundPlace?.toLowerCase() || "";

      return itemName.includes(searchValue) || place.includes(searchValue);
    });
  }, [foundItems, keyword]);

  const renderContent = () => {
    if (loading) {
      return <div className="loading-spinner">Loading items...</div>;
    }

    if (errorText) {
      return <div className="error-message">{errorText}</div>;
    }

    if (visibleItems.length === 0) {
      return (
          <div className="no-items">
            <p>No found items yet.</p>
            <button className="add-btn" onClick={() => navigate("/add-found")}>
              Report a Found Item
            </button>
          </div>
      );
    }

    return (
        <div className="items-grid">
          {visibleItems.map((item) => (
              <div key={item.id} className="item-card">
                <div className="item-image">
                  {item.imageUrl ? (
                      <img src={getFullImageUrl(item.imageUrl)} alt={item.itemName} />
                  ) : (
                      <div className="no-image">📷</div>
                  )}
                </div>

                <div className="item-info">
                  <h3>{item.itemName}</h3>
                  <p className="location">📍 {item.foundPlace}</p>
                  <p className="publisher">👤 {item.publisherName}</p>
                  <p className="description">{item.description?.slice(0, 80)}...</p>

                  <button className="view-btn" onClick={() => openDetails(item.id)}>
                    View Details
                  </button>
                </div>
              </div>
          ))}
        </div>
    );
  };

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
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
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

          {renderContent()}
        </div>

        {selectedFoundItem && (
            <div className="modal-overlay" onClick={closeDetails}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={closeDetails}>
                  ×
                </button>

                <div className="modal-image">
                  {selectedFoundItem.imageUrl ? (
                      <img
                          src={getFullImageUrl(selectedFoundItem.imageUrl)}
                          alt={selectedFoundItem.itemName}
                      />
                  ) : (
                      <div className="no-image">📷</div>
                  )}
                </div>

                <div className="modal-info">
                  <h2>{selectedFoundItem.itemName}</h2>
                  <p className="location">📍 {selectedFoundItem.foundPlace}</p>
                  <p className="publisher">👤 {selectedFoundItem.publisherName}</p>
                  <p className="contact">
                    📞 {selectedFoundItem.contactPhone || "Not provided"}
                  </p>
                  <p className="semester">
                    📅 {selectedFoundItem.year} – {selectedFoundItem.semester}
                  </p>
                  <p className="description">{selectedFoundItem.description}</p>
                </div>
              </div>
            </div>
        )}
      </div>
  );
}