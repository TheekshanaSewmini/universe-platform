import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
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
    lostDatetime: new Date().toISOString().slice(0, 16), // datetime-local format
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Only allow digits for phone number
  const handlePhoneChange = (e) => {
    const raw = e.target.value;
    const digits = raw.replace(/\D/g, "");
    setForm((prev) => ({ ...prev, contactPhone: digits }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Only JPG, PNG, WEBP, and GIF image types are allowed");
        e.target.value = "";
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be smaller than 5MB");
        e.target.value = "";
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !form.itemName.trim() ||
      !form.description.trim() ||
      !form.lostPlace.trim() ||
      !form.contactName.trim() ||
      !form.year ||
      !form.semester ||
      !form.lostDatetime
    ) {
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
    if (form.contactName.trim().length < 3) {
      toast.error("Your name must be at least 3 characters");
      return;
    }
    // Phone (optional): if provided, must be exactly 10 digits
    if (form.contactPhone && form.contactPhone.length !== 10) {
      toast.error("Contact phone must be exactly 10 digits (numbers only)");
      return;
    }
    // Datetime validation: cannot be in the future
    const selectedDateTime = new Date(form.lostDatetime);
    const now = new Date();
    if (selectedDateTime > now) {
      toast.error("Lost date and time cannot be in the future");
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
    const formData = new FormData();
    formData.append("itemName", form.itemName);
    formData.append("description", form.description);
    formData.append("lostPlace", form.lostPlace);
    formData.append("contactName", form.contactName);
    if (form.contactPhone) formData.append("contactPhone", form.contactPhone);
    formData.append("year", form.year);
    formData.append("semester", form.semester);
    // Send only the date part (YYYY-MM-DD) to the backend
    const dateOnly = form.lostDatetime.split("T")[0];
    formData.append("lostDate", dateOnly);
    if (imageFile) formData.append("image", imageFile);
    try {
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
    <div className="add-lost-page"><Navbar />
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
              onChange={handlePhoneChange}
              placeholder="+94XX-XXX-XXX"
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
            <label>Date & Time Lost *</label>
            <input
              type="datetime-local"
              name="lostDatetime"
              value={form.lostDatetime}
              onChange={handleChange}
              required
            />
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




