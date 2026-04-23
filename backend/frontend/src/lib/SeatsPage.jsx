import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../api/axios";
import "./SeatsPage.css";
import Navbar from "../components/Navbar";

const SECTION_OPTIONS = [
  { value: "UPPER_A_SIDE", label: "A - Upper Tier" },
  { value: "A_SIDE", label: "A - Central Zone" },
  { value: "BASE_A_SIDE", label: "A - Lower Tier" },
  { value: "UPPER_B_SIDE", label: "B - Upper Tier" },
  { value: "B_SIDE", label: "B - Central Zone" },
  { value: "BASE_B_SIDE", label: "B - Lower Tier" },
];

const SECTION_RENDER_ORDER = [
  "UPPER_A_SIDE",
  "UPPER_B_SIDE",
  "A_SIDE",
  "B_SIDE",
  "BASE_A_SIDE",
  "BASE_B_SIDE",
];

const getSectionLabel = (sectionValue) => {
  const match = SECTION_OPTIONS.find((item) => item.value === sectionValue);
  return match ? match.label : String(sectionValue || "").replace(/_/g, " ");
};

export default function SeatsPage() {
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ seatNumber: "", section: "" });
  const [searchTerm, setSearchTerm] = useState("");

  const sections = SECTION_OPTIONS.map((item) => item.value);

  const fetchSeats = async () => {
    try {
      const res = await api.get("/librarian/seats/all");
      setSeats(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load seats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeats();

    const intervalId = setInterval(fetchSeats, 10000);
    return () => clearInterval(intervalId);
  }, []);

  const filteredSeats = seats.filter((seat) =>
    seat.seatNumber.toString().includes(searchTerm)
  );

  const seatsBySection = filteredSeats.reduce((acc, seat) => {
    const section = seat.section || seat.seatSection;
    if (!acc[section]) acc[section] = [];
    acc[section].push(seat);
    return acc;
  }, {});

  const totalSeats = seats.length;
  const totalSections = Object.keys(seatsBySection).length;

  const handleSeatClick = async (seatId) => {
    try {
      const res = await api.get(`/librarian/seats/${seatId}`);
      setSelectedSeat(res.data);
      setEditForm({ seatNumber: res.data.seatNumber, section: res.data.section });
      setEditMode(false);
      setShowModal(true);
    } catch {
      toast.error("Failed to fetch seat details");
    }
  };

  const handleUpdate = async () => {
    if (!editForm.seatNumber) {
      toast.error("Seat number is required");
      return;
    }
    try {
      const res = await api.put(`/librarian/seats/${selectedSeat.id}`, {
        seatNumber: parseInt(editForm.seatNumber),
        section: editForm.section,
      });
      toast.success("Seat updated successfully");
      setSelectedSeat(res.data);
      setEditMode(false);
      fetchSeats();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this seat?")) return;
    try {
      await api.delete(`/librarian/seats/${selectedSeat.id}`);
      toast.success("Seat deleted successfully");
      setShowModal(false);
      fetchSeats();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedSeat(null);
    setEditMode(false);
  };

  return (
    <div className="seats-page">
      <ToastContainer position="top-right" autoClose={3000} />
      <Navbar />
      <div className="seats-container">
        <div className="page-header">
          <h1>Seat Management</h1>
          <p className="subtitle">Manage all library seats by section</p>
          <div className="stats-row">
            <div className="stat-card">
              <span className="stat-value">{totalSeats}</span>
              <span className="stat-label">Total Seats</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{totalSections}</span>
              <span className="stat-label">Sections</span>
            </div>
          </div>
          <div className="header-actions">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search seat number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="search-icon">🔍</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-spinner">Loading seats...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <div className="sections-grid">
            {SECTION_RENDER_ORDER.map((section) => {
              const sectionSeats = seatsBySection[section] || [];
              if (sectionSeats.length === 0) return null;
              return (
                <div key={section} className="section-card">
                  <div className="section-header">
                    <h3>{getSectionLabel(section)}</h3>
                    <span className="badge">{sectionSeats.length}</span>
                  </div>
                  <div className="seats-grid">
                    {sectionSeats.map((seat) => (
                      <div
                        key={seat.id}
                        className="seat-item"
                        onClick={() => handleSeatClick(seat.id)}
                      >
                        {seat.seatNumber}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && selectedSeat && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Seat {selectedSeat.seatNumber}</h3>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              {!editMode ? (
                <>
                  <div className="info-row">
                    <span className="label">ID:</span>
                    <span>{selectedSeat.id}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Section:</span>
                    <span>{getSectionLabel(selectedSeat.section)}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="input-group">
                    <label>Seat Number</label>
                    <input
                      type="number"
                      value={editForm.seatNumber}
                      onChange={(e) => setEditForm({ ...editForm, seatNumber: e.target.value })}
                    />
                  </div>
                  <div className="input-group">
                    <label>Section</label>
                    <select
                      value={editForm.section}
                      onChange={(e) => setEditForm({ ...editForm, section: e.target.value })}
                    >
                      {SECTION_OPTIONS.map((sec) => (
                        <option key={sec.value} value={sec.value}>{sec.label}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              {!editMode ? (
                <>
                  <button className="btn-edit" onClick={() => setEditMode(true)}>Edit</button>
                  <button className="btn-delete" onClick={handleDelete}>Delete</button>
                </>
              ) : (
                <>
                  <button className="btn-save" onClick={handleUpdate}>Save</button>
                  <button className="btn-cancel" onClick={() => setEditMode(false)}>Cancel</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}