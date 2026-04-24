import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../api/axios";
import "./LostItemDetail.css";
import Navbar from "../components/Navbar";

export default function LostItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
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
  const [submitting, setSubmitting] = useState(false);

  const backendBaseUrl = api.defaults.baseURL || "";
  const toAbsolute = (url) =>
    url ? (url.startsWith("http") ? url : backendBaseUrl + url) : null;

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await api.get(`/lostfound/lost/${id}`);
        setItem(res.data);
        setEditForm({
          itemName: res.data.itemName || "",
          description: res.data.description || "",
          lostPlace: res.data.lostPlace || "",
          contactName: res.data.contactName || "",
          contactPhone: res.data.contactPhone || "",
          year: res.data.year || "",
          semester: res.data.semester || "",
        });
        setImagePreview(toAbsolute(res.data.imageUrl));
      } catch (err) {
        setError(err.response?.data?.message || "Failed  to load item");
        toast.error("Could not load item details");
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("itemName", editForm.itemName);
      formData.append("description", editForm.description);
      formData.append("lostPlace", editForm.lostPlace);
      formData.append("contactName", editForm.contactName);
      formData.append("contactPhone", editForm.contactPhone);
      formData.append("year", editForm.year);
      formData.append("semester", editForm.semester);
      if (imageFile) formData.append("image", imageFile);
      const res = await api.put(`/lostfound/lost/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Item updated successfully!");
      setItem(res.data);
      setEditMode(false);
      setImageFile(null);
      setImagePreview(toAbsolute(res.data.imageUrl));
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await api.delete(`/lostfound/lost/${id}`);
      toast.success("Item deleted successfully!");
      navigate("/my-lost");
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  if (loading) return <div className="loading-spinner">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!item) return null;

  return (
    <div className="lost-item-detail-page">
      <ToastContainer position="top-right" autoClose={3000} />
      <Navbar />
      <div className="container">
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate("/my-lost")}>
            ← Back to My Lost Items
          </button>
          <h1>Item Details</h1>
          <p>View and manage your lost item</p>
        </div>

        <div className="detail-card">
          {!editMode ? (
            <>
              <div className="detail-image">
                {imagePreview ? (
                  <img src={imagePreview} alt={item.itemName} />
                ) : (
                  <div className="no-image">📷</div>
                )}
              </div>
              <div className="detail-info">
                <h2>{item.itemName}</h2>
                <p className="location">📍 {item.lostPlace}</p>
                <p className="contact-name">👤 {item.contactName}</p>
                <p className="contact-phone">📞 {item.contactPhone || "Not provided"}</p>
                <p className="semester">📅 {item.year} – {item.semester}</p>
                <p className="description">{item.description}</p>
              </div>
              <div className="detail-actions">
                <button className="edit-btn" onClick={() => setEditMode(true)}>
                  Edit
                </button>
                <button className="delete-btn" onClick={handleDelete}>
                  Delete
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={handleUpdate} className="edit-form">
              <div className="form-group">
                <label>Item Name</label>
                <input
                  type="text"
                  value={editForm.itemName}
                  onChange={(e) => setEditForm({ ...editForm, itemName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows="4"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Lost Place</label>
                <input
                  type="text"
                  value={editForm.lostPlace}
                  onChange={(e) => setEditForm({ ...editForm, lostPlace: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Your Name</label>
                <input
                  type="text"
                  value={editForm.contactName}
                  onChange={(e) => setEditForm({ ...editForm, contactName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Contact Phone</label>
                <input
                  type="tel"
                  value={editForm.contactPhone}
                  onChange={(e) => setEditForm({ ...editForm, contactPhone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Year</label>
                <select
                  value={editForm.year}
                  onChange={(e) => setEditForm({ ...editForm, year: e.target.value })}
                  required
                >
                  <option value="">Select Year</option>
                  <option value="FIRST">First Year</option>
                  <option value="SECOND">Second Year</option>
                  <option value="THIRD">Third Year</option>
                  <option value="FOURTH">Fourth Year</option>
                </select>
              </div>
              <div className="form-group">
                <label>Semester</label>
                <select
                  value={editForm.semester}
                  onChange={(e) => setEditForm({ ...editForm, semester: e.target.value })}
                  required
                >
                  <option value="">Select Semester</option>
                  <option value="SEM1">Semester 1</option>
                  <option value="SEM2">Semester 2</option>
                </select>
              </div>
              <div className="form-group">
                <label>Image</label>
                <input type="file" accept="image/*" onChange={handleImageChange} />
                {imagePreview && (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Preview" />
                  </div>
                )}
              </div>
              <div className="form-actions">
                <button type="submit" disabled={submitting}>
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
                <button type="button" onClick={() => setEditMode(false)}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}