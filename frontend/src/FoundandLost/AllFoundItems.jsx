import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import api from "../api/axios";
import Navbar from "../components/Navbar";
import "./FoundItemDetails.css";

const EMPTY_FORM = {
  itemName: "",
  description: "",
  foundPlace: "",
  publisherName: "",
  contactPhone: "",
  year: "",
  semester: "",
};

export default function FoundItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [foundItem, setFoundItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const baseUrl = api.defaults.baseURL || "";

  useEffect(() => {
    loadFoundItem();
  }, [id]);

  const makeImageUrl = (url) => {
    if (!url) return null;
    return url.startsWith("http") ? url : `${baseUrl}${url}`;
  };

  const loadFoundItem = async () => {
    try {
      const { data } = await api.get(`/lostfound/found/${id}`);

      setFoundItem(data);
      setForm({
        itemName: data.itemName || "",
        description: data.description || "",
        foundPlace: data.foundPlace || "",
        publisherName: data.publisherName || "",
        contactPhone: data.contactPhone || "",
        year: data.year || "",
        semester: data.semester || "",
      });
      setPreview(makeImageUrl(data.imageUrl));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load item");
      toast.error("Could not load item details");
    } finally {
      setLoading(false);
    }
  };

  const changeFormValue = ({ target }) => {
    setForm((oldForm) => ({
      ...oldForm,
      [target.name]: target.value,
    }));
  };

  const changeImage = (event) => {
    const selectedFile = event.target.files[0];

    setFile(selectedFile);

    if (!selectedFile) return;

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(selectedFile);
  };

  const buildFormData = () => {
    const data = new FormData();

    data.append("itemName", form.itemName);
    data.append("description", form.description);
    data.append("foundPlace", form.foundPlace);
    data.append("publisherName", form.publisherName);
    data.append("contactPhone", form.contactPhone);
    data.append("year", form.year);
    data.append("semester", form.semester);

    if (file) {
      data.append("image", file);
    }

    return data;
  };

  const updateItem = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const { data } = await api.put(`/lostfound/found/${id}`, buildFormData(), {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setFoundItem(data);
      setEditing(false);
      setFile(null);
      setPreview(makeImageUrl(data.imageUrl));

      toast.success("Item updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async () => {
    const confirmed = window.confirm("Are you sure you want to delete this item?");
    if (!confirmed) return;

    try {
      await api.delete(`/lostfound/found/${id}`);
      toast.success("Item deleted successfully!");
      navigate("/my-found");
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  if (loading) return <div className="loading-spinner">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!foundItem) return null;

  return (
      <div className="found-item-detail-page">
        <ToastContainer position="top-right" autoClose={3000} />
        <Navbar />

        <div className="container">
          <div className="page-header">
            <button className="back-btn" onClick={() => navigate("/my-found")}>
              ← Back to My Found Items
            </button>

            <h1>Item Details</h1>
            <p>View and manage your found item</p>
          </div>

          <div className="detail-card">
            {!editing ? (
                <>
                  <div className="detail-image">
                    {preview ? (
                        <img src={preview} alt={foundItem.itemName} />
                    ) : (
                        <div className="no-image">📷</div>
                    )}
                  </div>

                  <div className="detail-info">
                    <h2>{foundItem.itemName}</h2>
                    <p className="location">📍 {foundItem.foundPlace}</p>
                    <p className="publisher">👤 {foundItem.publisherName}</p>
                    <p className="contact">
                      📞 {foundItem.contactPhone || "Not provided"}
                    </p>
                    <p className="semester">
                      📅 {foundItem.year} – {foundItem.semester}
                    </p>
                    <p className="description">{foundItem.description}</p>
                  </div>

                  <div className="detail-actions">
                    <button className="edit-btn" onClick={() => setEditing(true)}>
                      Edit
                    </button>

                    <button className="delete-btn" onClick={deleteItem}>
                      Delete
                    </button>
                  </div>
                </>
            ) : (
                <form onSubmit={updateItem} className="edit-form">
                  <div className="form-group">
                    <label>Item Name</label>
                    <input
                        name="itemName"
                        type="text"
                        value={form.itemName}
                        onChange={changeFormValue}
                        required
                    />
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                        name="description"
                        rows="4"
                        value={form.description}
                        onChange={changeFormValue}
                        required
                    />
                  </div>

                  <div className="form-group">
                    <label>Found Place</label>
                    <input
                        name="foundPlace"
                        type="text"
                        value={form.foundPlace}
                        onChange={changeFormValue}
                        required
                    />
                  </div>

                  <div className="form-group">
                    <label>Your Name</label>
                    <input
                        name="publisherName"
                        type="text"
                        value={form.publisherName}
                        onChange={changeFormValue}
                        required
                    />
                  </div>

                  <div className="form-group">
                    <label>Contact Phone</label>
                    <input
                        name="contactPhone"
                        type="tel"
                        value={form.contactPhone}
                        onChange={changeFormValue}
                    />
                  </div>

                  <div className="form-group">
                    <label>Year</label>
                    <select
                        name="year"
                        value={form.year}
                        onChange={changeFormValue}
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
                        name="semester"
                        value={form.semester}
                        onChange={changeFormValue}
                        required
                    >
                      <option value="">Select Semester</option>
                      <option value="SEM1">Semester 1</option>
                      <option value="SEM2">Semester 2</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Image</label>
                    <input type="file" accept="image/*" onChange={changeImage} />

                    {preview && (
                        <div className="image-preview">
                          <img src={preview} alt="Preview" />
                        </div>
                    )}
                  </div>

                  <div className="form-actions">
                    <button type="submit" disabled={saving}>
                      {saving ? "Saving..." : "Save Changes"}
                    </button>

                    <button type="button" onClick={() => setEditing(false)}>
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