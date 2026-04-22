import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../api/axios";
import "./MyBookings.css";
import Navbar from "../components/Navbar";

export default function MyBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(null);
  const [revealed, setRevealed] = useState({});

  // Helper functions to safely extract seat details
  const getSeatNumber = (booking) => {
    return booking.seatNumber ?? booking.seat?.seatNumber ?? "N/A";
  };

  const getSection = (booking) => {
    const section = booking.section ?? booking.seat?.section;
    return section ? section.replace(/_/g, " ") : "N/A";
  };

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await api.get("/student/booking/my");
        setBookings(res.data);
        // Log the first booking to see structure (remove later)
        if (res.data.length) console.log("Sample booking:", res.data[0]);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load bookings");
        toast.error("Could not load your bookings");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;
    setCancelling(id);
    try {
      await api.delete(`/student/booking/cancel/${id}`);
      toast.success("Booking cancelled");
      setBookings(bookings.filter(b => b.id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || "Cancellation failed");
    } finally {
      setCancelling(null);
    }
  };

  const formatDate = (date) => date ? new Date(date).toLocaleString() : "N/A";

  const toggleReveal = (id) => setRevealed(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="my-bookings-page">
      <ToastContainer position="top-right" autoClose={3000} />
      <Navbar />
      <div className="container">
        <div className="page-header">
          <h1>My Bookings</h1>
          <p>View and manage your seat reservations</p>
        </div>

        {loading ? (
          <div className="loading-spinner">Loading your bookings...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : bookings.length === 0 ? (
          <div className="no-bookings">
            <div className="empty-icon">📖</div>
            <p>You have no bookings yet.</p>
            <button className="book-now-btn" onClick={() => navigate("/seat-availability")}>
              Book a Seat
            </button>
          </div>
        ) : (
          <div className="bookings-grid">
            {bookings.map(booking => (
              <div key={booking.id} className="booking-card">
                <div className="booking-header">
                  <div className="booking-icon">💺</div>
                  <div>
                    <h3>Seat {getSeatNumber(booking)}</h3>
                    <p className="booking-section">{getSection(booking)}</p>
                  </div>
                </div>
                <div className="booking-details">
                  <div className="detail-row">
                    <span className="label">Start:</span>
                    <span>{formatDate(booking.startTime)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">End:</span>
                    <span>{formatDate(booking.endTime)}</span>
                  </div>
                  <div className="detail-row passkey-row">
                    <span className="label">Passkey:</span>
                    <span className="passkey-toggle" onClick={() => toggleReveal(booking.id)}>
                      {revealed[booking.id] ? (
                        <code className="passkey-display">{booking.passKey}</code>
                      ) : (
                        <span className="passkey-hidden">🔒 Click to reveal</span>
                      )}
                    </span>
                  </div>
                </div>
                <div className="booking-footer">
                  <button
                    className="cancel-btn"
                    onClick={() => handleCancel(booking.id)}
                    disabled={cancelling === booking.id}
                  >
                    {cancelling === booking.id ? "Cancelling..." : "Cancel Booking"}
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