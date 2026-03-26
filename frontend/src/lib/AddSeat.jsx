import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../api/axios";
import "./AddSeat.css";
import Navbar from "../components/Navbar";

export default function AddSeat() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [addedSeat, setAddedSeat] = useState(null);
  const [form, setForm] = useState({
    seatNumber: "",
    section: "A_SIDE",
  });

  const sections = [
    "A_SIDE",
    "B_SIDE",
    "UPPER_A_SIDE",
    "UPPER_B_SIDE",
    "BASE_A_SIDE",
    "BASE_B_SIDE",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const seatNumber = parseInt(form.seatNumber, 10);
    if (!form.seatNumber || Number.isNaN(seatNumber)) {
      toast.error("Seat number is required and should be a valid number");
      return;
    }
    if (seatNumber < 1 || seatNumber > 1000) {
      toast.error("Seat number must be between 1 and 1000");
      return;
    }
    if (!form.section) {
      toast.error("Please select a section");
      return;
    }

    setLoading(true);
    try {
    
      const res = await api.post("/librarian/seats/craete", {
        seatNumber,
        section: form.section,
      });
      const newSeatId = res.data.id;

    
      const seatRes = await api.get(`/librarian/seats/${newSeatId}`);
      setAddedSeat(seatRes.data);

      toast.success(`Seat ${form.seatNumber} added successfully!`);
 
      setForm({ seatNumber: "", section: "A_SIDE" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add seat");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-seat-page">
      <ToastContainer position="top-right" autoClose={3000} />
      <Navbar />
      <div className="add-seat-container">
        <div className="add-seat-card">
          <h2>Add New Seat</h2>
          <p>Fill in the details below to add a new library seat</p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Seat Number</label>
              <input
                type="number"
                name="seatNumber"
                value={form.seatNumber}
                onChange={handleChange}
                placeholder="Enter seat number"
                min="1"
                max="1000"
                required
              />
            </div>
            <div className="form-group">
              <label>Section</label>
              <select name="section" value={form.section} onChange={handleChange}>
                {sections.map((sec) => (
                  <option key={sec} value={sec}>
                    {sec.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? "Adding..." : "Add Seat"}
            </button>
          </form>

          {addedSeat && (
            <div className="added-seat-card">
              <h3>✅ Seat Added Successfully!</h3>
              <div className="seat-details">
                <p><strong>Seat ID:</strong> {addedSeat.id}</p>
                <p><strong>Seat Number:</strong> {addedSeat.seatNumber}</p>
                <p><strong>Section:</strong> {addedSeat.section?.replace(/_/g, " ")}</p>
              </div>
              <button
                className="view-all-btn"
                onClick={() => navigate("/librarianhome")}
              >
                View All
              </button>
            </div>
          )}

          <button className="back-btn" onClick={() => navigate("/librarianhome")}>
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}