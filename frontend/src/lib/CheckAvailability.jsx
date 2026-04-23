import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../api/axios";
import "./CheckAvailability.css";
import Navbar from "../components/Navbar";

const SECTIONS = ["A_SIDE", "B_SIDE", "UPPER_A_SIDE", "UPPER_B_SIDE", "BASE_A_SIDE", "BASE_B_SIDE"];

export default function CheckAvailability() {
  const [seats, setSeats] = useState([]);
  const [selectedSection, setSelectedSection] = useState(SECTIONS[0]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(null);


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

  const handleCheck = async () => {
    if (!selectedSeat) {
      toast.error("Please select a seat");
      return;
    }
    if (!startDateTime || !endDateTime) {
      toast.error("Please select start and end times");
      return;
    }
    const start = new Date(startDateTime);
    const end = new Date(endDateTime);
    const now = new Date();
    if (start >= end) {
      toast.error("End time must be after start time");
      return;
    }
    if (start < now) {
      toast.error("Start time cannot be in the past");
      return;
    }
    const maxDays = 30;
    if ((start - now) / (1000 * 60 * 60 * 24) > maxDays) {
      toast.error(`Start time must be within ${maxDays} days from now`);
      return;
    }

    setChecking(true);
    setResult(null);
    try {
      const res = await api.get("/student/booking/check", {
        params: {
          seatNumber: selectedSeat.seatNumber,
          section: selectedSeat.section,
          start: startDateTime,
          end: endDateTime,
        },
      });
      setResult({ success: true, message: res.data });
    } catch (err) {
      setResult({ success: false, message: err.response?.data?.message || "Check failed" });
    } finally {
      setChecking(false);
    }
  };

  const sectionSeats = seats.filter(s => (s.section || s.seatSection) === selectedSection);

  return (
    <div className="check-availability-page">
      <ToastContainer position="top-right" autoClose={3000} />
      <Navbar />
      <div className="container">
        <div className="page-header">
           <h1>Check Seat Availability</h1>

          <p>Verify if a seat is free for a specific time slot</p>
        </div>

        <div className="check-card">
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
              <label>Start Time</label>
              <input
                type="datetime-local"
                value={startDateTime}
                onChange={(e) => setStartDateTime(e.target.value)}
              />
            </div>

            <div className="control-group">
              <label>End Time</label>
              <input
                type="datetime-local"
                value={endDateTime}
                onChange={(e) => setEndDateTime(e.target.value)}
              />
            </div>
          </div>

          <div className="action">
            <button
              className="check-btn"
              onClick={handleCheck}
              disabled={checking}
            >
              {checking ? "Checking..." : "Check Availability"}
            </button>
          </div>

          {result && (
            <div className={`result-card ${result.success ? "success" : "error"}`}>
              <div className="result-icon">{result.success ? "✅" : "❌"}</div>
              <div className="result-message">{result.message}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}