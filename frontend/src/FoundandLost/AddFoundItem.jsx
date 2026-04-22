import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/axios";
import "./AddFoundItem.css";
import Navbar from "../components/Navbar";

export default function AddFoundItem() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    itemName: "",
    description: "",
    foundPlace: "",
    publisherName: "",
    contactPhone: "",
    year: "",
    semester: "",
    foundDatetime: new Date().toISOString().slice(0, 16), // datetime-local format: "YYYY-MM-DDTHH:MM"
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [addedItem, setAddedItem] = useState(null);

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
      !form.foundPlace.trim() ||
      !form.publisherName.trim() ||
      !form.contactPhone.trim() ||
      !form.year ||
      !form.semester ||
      !form.foundDatetime
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
    if (form.foundPlace.trim().length < 2) {
      toast.error("Found place must be at least 2 characters");
      return;
    }
    if (form.publisherName.trim().length < 3) {
      toast.error("Publisher name must be at least 3 characters");
      return;
    }
    // Phone: exactly 10 digits
    if (form.contactPhone.length !== 10) {
      toast.error("Contact phone must be exactly 10 digits");
      return;
    }
    // Datetime validation: cannot be in the future
    const selectedDateTime = new Date(form.foundDatetime);
    const now = new Date();
    if (selectedDateTime > now) {
      toast.error("Found date and time cannot be in the future");
      return;
    }
    if (!imageFile) {
      toast.error("Please upload an image");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append("itemName", form.itemName);
    formData.append("description", form.description);
    formData.append("foundPlace", form.foundPlace);
    formData.append("publisherName", form.publisherName);
    formData.append("contactPhone", form.contactPhone);
    formData.append("year", form.year);
    formData.append("semester", form.semester);
    // Send only the date part (YYYY-MM-DD) to the backend
    const dateOnly = form.foundDatetime.split("T")[0];
    formData.append("foundDate", dateOnly);
    formData.append("image", imageFile);
    try {
      const res = await api.post("/lostfound/found", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      toast.success("Found item added!");
      setAddedItem(res.data);
      setForm({
        itemName: "",
        description: "",
        foundPlace: "",
        publisherName: "",
        contactPhone: "",
        year: "",
        semester: "",
        foundDatetime: new Date().toISOString().slice(0, 16),
      });
      setImageFile(null);
      setImagePreview(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-found-page"><Navbar />
      <div className="container">
        <div className="page-header">
          <h1>Report Found Item</h1>
          <p>Help someone find their lost belongings</p>
        </div>
        <div className="form-card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Item Name</label>
              <input type="text" name="itemName" value={form.itemName} onChange={handleChange} placeholder="" required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows="4" placeholder="" required></textarea>
            </div>
            <div className="form-group">
              <label>Found Place</label>
              <input type="text" name="foundPlace" value={form.foundPlace} onChange={handleChange} placeholder="" required />
            </div>
            <div className="form-group">
              <label>Your Name</label>
              <input type="text" name="publisherName" value={form.publisherName} onChange={handleChange} placeholder="" required />
            </div>
            <div className="form-group">
              <label>Contact Phone</label>
              <input
                type="tel"
                name="contactPhone"
                value={form.contactPhone}
                onChange={handlePhoneChange}
                placeholder="+94XX-XXX-XXXX"
                required
              />
            </div>
            <div className="form-group">
              <label>Year</label>
              <select name="year" value={form.year} onChange={handleChange} required>
                <option value="">Select Year</option>
                <option value="FIRST">First</option>
                <option value="SECOND">Second</option>
                <option value="THIRD">Third</option>
                <option value="FOURTH">Fourth</option>
              </select>
            </div>
            <div className="form-group">
              <label>Semester</label>
              <select name="semester" value={form.semester} onChange={handleChange} required>
                <option value="">Select Semester</option>
                <option value="SEM1">Semester 1</option>
                <option value="SEM2">Semester 2</option>
              </select>
            </div>
            <div className="form-group">
              <label>Date & Time Found</label>
              <input
                type="datetime-local"
                name="foundDatetime"
                value={form.foundDatetime}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Image</label>
              <input type="file" accept="image/*" onChange={handleImageChange} required />
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                </div>
              )}
            </div>
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? "Adding..." : "Add Found Item"}
            </button>
          </form>
          {addedItem && (
            <div className="added-item-card">
              <h3>✅ Item Added!</h3>
              <div className="item-details">
                <p><strong>Title:</strong> {addedItem.itemName}</p>
                <p><strong>Location:</strong> {addedItem.foundPlace}</p>
                <p><strong>Date:</strong> {new Date(addedItem.foundDate).toLocaleDateString()}</p>
                <p><strong>Description:</strong> {addedItem.description}</p>
                {addedItem.imageUrl && (
                  <img src={addedItem.imageUrl} alt={addedItem.itemName} />
                )}
              </div>
              <button className="view-all-btn" onClick={() => navigate("/my-found")}>
                View My Found Items
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}




