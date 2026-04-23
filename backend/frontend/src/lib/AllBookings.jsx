import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../api/axios";
import "./AllBookings.css";
import Navbar from "../components/Navbar";

export default function AllBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [revealed, setRevealed] = useState({});
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await api.get("/student/booking/all");
        setBookings(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load bookings");
        toast.error("Could not load bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();

    const intervalId = setInterval(fetchBookings, 10000);
    return () => clearInterval(intervalId);
  }, []);

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Cancel this booking?")) return;
    setCancelling(bookingId);
    try {
      await api.delete(`/student/booking/cancel/${bookingId}`);
      toast.success("Booking cancelled");
      setBookings(bookings.filter(b => b.id !== bookingId));
    } catch (err) {
      toast.error(err.response?.data?.message || "Cancellation failed");
    } finally {
      setCancelling(null);
    }
  };

  const formatDate = (date) => date ? new Date(date).toLocaleString() : "N/A";

  const toggleReveal = (id) => setRevealed(prev => ({ ...prev, [id]: !prev[id] }));

  // Helper to get seat number from booking (nested or direct)
  const getSeatNumber = (booking) => {
    if (booking.seatNumber) return booking.seatNumber;
    if (booking.seat?.seatNumber) return booking.seat.seatNumber;
    return "N/A";
  };

  const getSeatSection = (booking) => {
    if (booking.section) return booking.section;
    if (booking.seat?.section) return booking.seat.section;
    return "N/A";
  };

  const getStudentEmail = (booking) => {
    if (booking.student?.email) return booking.student.email;
    if (booking.studentEmail) return booking.studentEmail;
    return "N/A";
  };

  const filteredBookings = bookings.filter(booking => {
    if (!booking) return false;
    const seatNum = getSeatNumber(booking).toString();
    const section = getSeatSection(booking);
    const studentEmail = getStudentEmail(booking);
    const term = searchTerm.toLowerCase();
    return seatNum.includes(term) ||
           section.toLowerCase().includes(term) ||
           studentEmail.toLowerCase().includes(term);
  });

  return (
    <div className="all-bookings-page">

      <Navbar />
      <div className="container">
        <div className="page-header">
          <h1>All Bookings</h1>
          <p>Manage all seat reservations</p>
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by seat, section, or student..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>
        </div>

        {loading ? (
          <div className="loading-spinner">Loading bookings...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : filteredBookings.length === 0 ? (
          <div className="no-bookings">
            <div className="empty-icon">📖</div>
            <p>No bookings found.</p>
          </div>
        ) : (
          <div className="bookings-grid">
            {filteredBookings.map(booking => (
              <div key={booking.id} className="booking-card">
                <div className="booking-header">
                  <div className="booking-icon">💺</div>
                  <div>
                    <h3>Seat {getSeatNumber(booking)}</h3>
                    <p className="booking-section">{getSeatSection(booking).replace(/_/g, " ")}</p>
                  </div>
                </div>
                <div className="booking-details">
                  <div className="detail-row">
                    <span className="label">Student:</span>
                    <span>{getStudentEmail(booking)}</span>
                  </div>
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