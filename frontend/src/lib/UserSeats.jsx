import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../api/axios";
import "./UserSeats.css";
import Navbar from "../components/Navbar";
import bookingBg from "../assets/booking-bg.jpg.png";

const SECTIONS = ["A_SIDE", "B_SIDE", "UPPER_A_SIDE", "UPPER_B_SIDE", "BASE_A_SIDE", "BASE_B_SIDE"];

export default function UserSeats() {
  const navigate = useNavigate();
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [booking, setBooking] = useState({ startTime: "", endTime: "" });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [userBookings, setUserBookings] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [seatsRes, bookingsRes] = await Promise.all([
          api.get("/librarian/seats/all"),
          api.get("/student/booking/my"),
        ]);
        setSeats(seatsRes.data);
        setUserBookings(bookingsRes.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);


  const filteredSeats = seats.filter(seat => seat.seatNumber.toString().includes(searchTerm));
  const seatsBySection = filteredSeats.reduce((acc, seat) => {
    const sec = seat.section || seat.seatSection;
    (acc[sec] = acc[sec] || []).push(seat);
    return acc;
  }, {});

  const totalSeats = seats.length;
  const totalSections = Object.keys(seatsBySection).length;

  const handleSeatClick = (seat) => {
    setSelectedSeat(seat);
    setShowModal(true);
    setBooking({ startTime: "", endTime: "" });
  };

  const buildEndDateTimeFromStart = (startDateTime, endTimeOnly) => {
    if (!startDateTime || !endTimeOnly) return "";
    const start = new Date(startDateTime);
    if (Number.isNaN(start.getTime())) return "";
    const [hh, minutePart] = String(endTimeOnly).split(":");
    const hours = Number(hh);
    const minutes = Number(minutePart);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return "";

    const end = new Date(start);
    end.setHours(hours, minutes, 0, 0);
    const yyyy = end.getFullYear();
    const MM = String(end.getMonth() + 1).padStart(2, "0");
    const dd = String(end.getDate()).padStart(2, "0");
    const HH = String(end.getHours()).padStart(2, "0");
    const mm = String(end.getMinutes()).padStart(2, "0");
    const ss = String(end.getSeconds()).padStart(2, "0");
    return `${yyyy}-${MM}-${dd}T${HH}:${mm}:${ss}`;
  };

  const toLocalDateTimeString = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const yyyy = date.getFullYear();
    const MM = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const HH = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");
    const ss = String(date.getSeconds()).padStart(2, "0");
    return `${yyyy}-${MM}-${dd}T${HH}:${mm}:${ss}`;
  };

  const handleBooking = async () => {
    const { startTime, endTime } = booking;
    if (!startTime || !endTime) return toast.error("Select start and end time");

    const endDateTimeIso = buildEndDateTimeFromStart(startTime, endTime);
    if (!endDateTimeIso) return toast.error("Select a valid end time");

    const start = new Date(startTime);
    const end = new Date(endDateTimeIso);
    const now = new Date();
    if (start < now) return toast.error("Start time cannot be in the past");
    if (start >= end) return toast.error("End time must be after start time");
    if ((end - start) / (1000 * 60 * 60) > 2) return toast.error("Max booking is 2 hours");

    const selectedDate = start.toISOString().split("T")[0];
    const todaysBookings = userBookings.filter(b => new Date(b.startTime).toISOString().split("T")[0] === selectedDate).length;
    if (todaysBookings >= 2) return toast.error("You already have 2 bookings today. Choose another day.");

    setBookingLoading(true);
    try {
      const normalizedStartTime = toLocalDateTimeString(startTime);
      if (!normalizedStartTime) {
        toast.error("Invalid start time format");
        setBookingLoading(false);
        return;
      }

      const res = await api.post("/student/booking/book", {
        seatNumber: selectedSeat.seatNumber,
        section: selectedSeat.section,
        startTime: normalizedStartTime,
        endTime: endDateTimeIso,
        passKey: "",
      });
      toast.success(res.data || "Booking successful!");
      setShowModal(false);
  
      const updated = await api.get("/student/booking/my");
      setUserBookings(updated.data);
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data || "Booking failed");
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="user-seats-page" style={{ "--booking-bg": `url(${bookingBg})` }}>
      <ToastContainer position="top-right" autoClose={3000} />
      <Navbar />
      <div className="user-seats-container">
        <div className="page-header">
          <h1>Book a Seat</h1>
          <p className="subtitle">Reserve your study space in the library</p>

          <div className="stats-row">
            <div className="stat-card">
              <span className="stat-icon">🪑</span>
              <span className="stat-value">{totalSeats}</span>
              <span className="stat-text">Total Seats</span>
            </div>
            <div className="stat-card">
              <span className="stat-icon">🧩</span>
              <span className="stat-value">{totalSections}</span>
              <span className="stat-text">Sections</span>
            </div>
          </div>

          <div className="header-actions">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search seat..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <span className="search-icon">🔍</span>
            </div>
            <button className="my-bookings-btn" onClick={() => navigate("/myBookings")}>My Bookings</button>
          </div>
        </div>

        {loading ? <div className="loading-spinner">Loading seats...</div> : error ? <div className="error-message">{error}</div> :
          <div className="sections-tray">
            <div className="sections-grid">
            {SECTIONS.map(section => {
              const sectionSeats = seatsBySection[section] || [];
              if (!sectionSeats.length) return null;
              return (
                <div key={section} className="section-card">
                  <div className="section-header">
                    <div className="section-title">
                      <span className="section-icon">▦</span>
                      <h3>{section.replace(/_/g, " ")}</h3>
                    </div>
                    <span className="badge">{sectionSeats.length}</span>
                  </div>
                  <div className="seats-grid">
                    {sectionSeats.map(seat => (
                      <button
                        key={seat.id}
                        type="button"
                        className="seat-item"
                        onClick={() => handleSeatClick(seat)}
                      >
                        <span className="seat-number">{seat.seatNumber}</span>
                        <span className="seat-book">Book</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
            </div>
          </div>
        }
      </div>

      {showModal && selectedSeat && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Book Seat {selectedSeat.seatNumber}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="info-row"><span className="label">Section:</span><span>{selectedSeat.section?.replace(/_/g, " ")}</span></div>
              <div className="input-group"><label>Start Time</label><input type="datetime-local" value={booking.startTime} onChange={e => setBooking({ ...booking, startTime: e.target.value })} /></div>
                    <div className="input-group"><label>End Time</label><input type="time" value={booking.endTime} onChange={e => setBooking({ ...booking, endTime: e.target.value })} /></div>
              <small className="info-note">You will receive a passkey after booking.</small>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-book" onClick={handleBooking} disabled={bookingLoading}>
                {bookingLoading ? "Booking..." : "Confirm Booking"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}