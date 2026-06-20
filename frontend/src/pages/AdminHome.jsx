import { useEffect, useState } from "react";
import api from "../api/axios";
import "./css/AdminHome.css";
import universeLogo from "../assets/universe-logo.png";

export default function AdminHome() {
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);


  const fetchUsers = async () => {
    try {
      const res = await api.get("/user/all");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };


  const fetchBookings = async () => {
    try {
      const res = await api.get("/student/booking/all");
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchBookings();
  }, []);

  return (

     <div className="admin-container">
      <div className="admin-header">
        <div className="admin-brand">
          <img src={universeLogo} alt="UniVerse logo" className="admin-logo" />
          <div>
            <h1>Admin Dashboard</h1>
            <p>UniVerse management overview</p>
          </div>
        </div>
      </div>

      <h2>All Users</h2>
      <ul>
        {users.map((u) => (
          <li key={u.id}>
            <b>{u.name} {u.lastName}</b> - {u.email} ({u.role})
          </li>
        ))}
      </ul>

    
      <h2>All Bookings</h2>
      <ul className="booking-list">
        {bookings.map((b) => (
          <li key={b.id} className={b.active ? "active" : "inactive"}>
            <span>
              Booking ID: <b>{b.id}</b> | 
              Seat: <b>{b.seat?.seatNumber ?? "Unknown"}</b> | 
              <b>{b.student?.firstname ?? "Unknown"}</b> |  
              Passcode: <span className="passcode">{b.passKey ?? "N/A"}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
