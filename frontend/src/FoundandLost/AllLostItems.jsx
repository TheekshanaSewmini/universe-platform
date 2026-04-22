import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/axios";
import "./AllLostItems.css";
import Navbar from "../components/Navbar";

export default function AllLostItems() {
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
  const toTime = (item) => {
    const raw =
      item?.createdAt ??
      item?.created_at ??
      item?.reportedAt ??
      item?.reported_at ??
      item?.lostDate ??
      item?.foundDate;
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
        const res = await api.get("/lostfound/lost");
        setItems(sortByDateDesc(res.data || []));
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load items");
        toast.error("Could not load lost items");
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const handleViewDetails = async (id) => {
    try {
      const res = await api.get(`/lostfound/lost/${id}`);
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
    const place = item.lostPlace?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();
    return name.includes(search) || place.includes(search);
  });

  return (
    <div className="all-lost-page"><Navbar />
      <div className="container">
        <div className="page-header">
          <h1>All Lost Items</h1>
          <p>Browse items reported as lost</p>
          <div className="search-box">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-icon"></span>
          </div>
          <div className="action-buttons">
            <button className="my-lost-btn" onClick={() => navigate("/my-lost")}>
              My Lost Items
            </button>
            <button className="add-lost-btn" onClick={() => navigate("/add-lost")}>
              Report Lost Item
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-spinner">Loading items...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : filteredItems.length === 0 ? (
          <div className="no-items">
            <p>No lost items yet.</p>
            <button className="add-btn" onClick={() => navigate("/add-lost")}>
              Report a Lost Item
            </button>
          </div>
        ) : (
          <div className="items-grid">
            {filteredItems.map((item, index) => (
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
                  <p className="location">📍 {item.lostPlace}</p>
                  <p className="contact-name">👤 {item.contactName}</p>
                  <p className="date">📅 {new Date(item.lostDate).toLocaleDateString()}</p>
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
              <p className="location">📍 {selectedItem.lostPlace}</p>
              <p className="contact-name">👤 {selectedItem.contactName}</p>
              <p className="contact">📞 {selectedItem.contactPhone || "Not provided"}</p>
              <p className="date">📅 {new Date(selectedItem.lostDate).toLocaleDateString()}</p>
              <p className="semester">📅 {selectedItem.year} – {selectedItem.semester}</p>
              <p className="description">{selectedItem.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}





