import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../api/axios";
import "./SeatAvailability.css";
import Navbar from "../components/Navbar";

const SECTIONS = ["A_SIDE", "B_SIDE", "UPPER_A_SIDE", "UPPER_B_SIDE", "BASE_A_SIDE", "BASE_B_SIDE"];

export default function SeatAvailability() {
  const navigate = useNavigate();
  const [seats, setSeats] = useState([]);
  const [selectedSection, setSelectedSection] = useState(SECTIONS[0]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);


  useEffect(() => {
    const fetchSeats = async () => {
      try {
        const res = await api.get("/librarian/seats/all");
        setSeats(res.data);
        const sectionSeats = res.data.filter(s => (s.section || s.seatSection) === selectedSection);
        if (sectionSeats.length) setSelectedSeat(sectionSeats[0]);
      } catch {
        toast.error("Failed to load seats");
      }
    };
    fetchSeats();
  }, []);


  useEffect(() => {
    const sectionSeats = seats.filter(s => (s.section || s.seatSection) === selectedSection);
    if (sectionSeats.length) setSelectedSeat(sectionSeats[0]);
    else setSelectedSeat(null);
  }, [selectedSection, seats]);

  useEffect(() => {
    if (selectedSeat && selectedDate) {
      fetchAvailability();
    }
  }, [selectedSeat, selectedDate]);

  const fetchAvailability = async () => {
    setLoading(true);
    try {
      const res = await api.get("/student/booking/seat/availability", {
        params: {
          seatNumber: selectedSeat.seatNumber,
          section: selectedSeat.section,
          date: selectedDate,
        },
      });
      setAvailableSlots(res.data.availablePeriods || []);
      setBookedSlots(res.data.bookedPeriods || []);
    } catch {
      toast.error("Failed to load availability");
      setAvailableSlots([]);
      setBookedSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSlotClick = (slot, isAvailableSlot) => {
    setSelectedSlot(slot);
    setIsAvailable(isAvailableSlot);
    setShowSlotModal(true);
  };

  const handleBookNow = () => {
    if (!selectedSlot) return;
    navigate("/userSeats", {
      state: {
        seatNumber: selectedSeat.seatNumber,
        section: selectedSeat.section,
        date: selectedDate,
        startTime: selectedSlot.start,
        endTime: selectedSlot.end,
      },
    });
  };

  const closeModal = () => {
    setShowSlotModal(false);
    setSelectedSlot(null);
  };

  const sectionSeats = seats.filter(s => (s.section || s.seatSection) === selectedSection);

  return (
    <div className="seat-availability-page">
      <ToastContainer position="top-right" autoClose={3000} />
      <Navbar />
      <div className="container">
        <div className="page-header">
          <h1> Seat Booking Availability</h1>
          <p>Select a section, seat, and date to view time slots</p>
        </div>

        <div className="selection-controls">
          <div className="control-group">
            <label>Section</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
            >
              {SECTIONS.map(section => (
                <option key={section} value={section}>
                  {section.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <label>Seat</label>
            <select
              value={selectedSeat?.id || ""}
              onChange={(e) => {
                const seat = seats.find(s => s.id === parseInt(e.target.value));
                setSelectedSeat(seat);
              }}
              disabled={sectionSeats.length === 0}
            >
              {sectionSeats.map(seat => (
                <option key={seat.id} value={seat.id}>
                  Seat {seat.seatNumber}
                </option>
              ))}
              {sectionSeats.length === 0 && (
                <option disabled>No seats in this section</option>
              )}
            </select>
          </div>

          <div className="control-group">
            <label>Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>
        </div>

        <div className="availability-section">
          <h2>Time Slots</h2>
          {loading ? (
            <div className="loading-spinner">Loading availability...</div>
          ) : (
            <>
              {availableSlots.length === 0 && bookedSlots.length === 0 ? (
                <p className="no-slots">No slots available for this seat and date</p>
              ) : (
                <>
                  {availableSlots.length > 0 && (
                    <div className="slots-group">
                      <h3>Available</h3>
                      <div className="slots-grid">
                        {availableSlots.map((slot, idx) => (
                          <div
                            key={idx}
                            className="slot-card available"
                            onClick={() => handleSlotClick(slot, true)}
                          >
                            <div className="slot-time">
                              {slot.start.slice(0,5)} – {slot.end.slice(0,5)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {bookedSlots.length > 0 && (
                    <div className="slots-group">
                      <h3>Booked</h3>
                      <div className="slots-grid">
                        {bookedSlots.map((slot, idx) => (
                          <div
                            key={idx}
                            className="slot-card booked"
                            onClick={() => handleSlotClick(slot, false)}
                          >
                            <div className="slot-time">
                              {slot.start.slice(0,5)} – {slot.end.slice(0,5)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>

    
      {showSlotModal && selectedSlot && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Time Slot Details</h3>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="slot-details">
                <p><strong>Seat:</strong> {selectedSeat?.seatNumber}</p>
                <p><strong>Section:</strong> {selectedSeat?.section?.replace(/_/g, " ")}</p>
                <p><strong>Date:</strong> {selectedDate}</p>
                <p><strong>Time:</strong> {selectedSlot.start.slice(0,5)} – {selectedSlot.end.slice(0,5)}</p>
              </div>
            </div>
            <div className="modal-footer">
              {isAvailable ? (
                <button className="btn-book" onClick={handleBookNow}>
                  Book Now
                </button>
              ) : (
                <p className="booked-message">This slot is already booked.</p>
              )}
              <button className="btn-close" onClick={closeModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}