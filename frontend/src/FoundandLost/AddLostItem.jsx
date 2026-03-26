import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../api/axios";
import "./AddLostItem.css";
import Navbar from "../components/Navbar";

export default function AddLostItem() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    itemName: "",
    description: "",
    lostPlace: "",
    contactName: "",   
    contactPhone: "",
    year: "",
    semester: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.itemName.trim() || !form.description.trim() || !form.lostPlace.trim() || !form.contactName.trim()) {
      toast.error("Please fill all required fields");
      return;
    }
    if (form.itemName.trim().length < 3) {
      toast.error("Item name must be at least 3 characters");
      return;
    }
    if (form.description.trim().length < 10) {
      toast.error("Description must be at least 10 characters");
      return;
    }
    if (form.lostPlace.trim().length < 2) {
      toast.error("Lost place must be at least 2 characters");
      return;
    }
    if (!form.year) {
      toast.error("Please select year");
      return;
    }
    if (!form.semester) {
      toast.error("Please select semester");
      return;
    }
    if (form.contactPhone && !/^\+?[0-9]{7,15}$/.test(form.contactPhone.trim())) {
      toast.error("Enter a valid contact phone number");
      return;
    }
    if (imageFile) {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      if (!allowedTypes.includes(imageFile.type)) {
        toast.error("Only JPG, PNG, WEBP, and GIF images are allowed");
        return;
      }
      if (imageFile.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }
    }
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      if (imageFile) formData.append("image", imageFile);
      await api.post("/lostfound/lost", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Item reported successfully!");
      navigate("/my-lost");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to report item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-lost-page">
      <ToastContainer position="top-right" autoClose={3000} />
      <Navbar />
      <div className="container">
        <div className="page-header">
          <h1>Report Lost Item</h1>
          <p>Help others find what you've lost</p>
        </div>
        <form onSubmit={handleSubmit} className="add-form">
          <div className="form-group">
            <label>Item Name *</label>
            <input
              type="text"
              name="itemName"
              value={form.itemName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              rows="4"
              value={form.description}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Lost Place *</label>
            <input
              type="text"
              name="lostPlace"
              value={form.lostPlace}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Your Name *</label>
            <input
              type="text"
              name="contactName"
              value={form.contactName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Contact Phone</label>
            <input
              type="tel"
              name="contactPhone"
              value={form.contactPhone}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Year *</label>
            <select name="year" value={form.year} onChange={handleChange} required>
              <option value="">Select Year</option>
              <option value="FIRST">First Year</option>
              <option value="SECOND">Second Year</option>
              <option value="THIRD">Third Year</option>
              <option value="FOURTH">Fourth Year</option>
            </select>
          </div>
          <div className="form-group">
            <label>Semester *</label>
            <select name="semester" value={form.semester} onChange={handleChange} required>
              <option value="">Select Semester</option>
              <option value="SEM1">Semester 1</option>
              <option value="SEM2">Semester 2</option>
            </select>
          </div>
          <div className="form-group">
            <label>Image (optional)</label>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
              </div>
            )}
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Reporting..." : "Report Item"}
          </button>
        </form>
      </div>
    </div>
  );
}