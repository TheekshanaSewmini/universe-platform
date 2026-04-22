import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/axios";
import "./FoundItemDetails.css";
import Navbar from "../components/Navbar";

export default function FoundItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    itemName: "",
    description: "",
    foundPlace: "",
    publisherName: "",
    contactPhone: "",
    year: "",
    semester: "",
    foundDate: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const backendBaseUrl = api.defaults.baseURL || "";
  const toAbsolute = (url) =>
    url ? (url.startsWith("http") ? url : backendBaseUrl + url) : null;

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await api.get(`/lostfound/found/${id}`);
        setItem(res.data);
        setEditForm({
          itemName: res.data.itemName || "",
          description: res.data.description || "",
          foundPlace: res.data.foundPlace || "",
          publisherName: res.data.publisherName || "",
          contactPhone: res.data.contactPhone || "",
          year: res.data.year || "",
          semester: res.data.semester || "",
          foundDate: res.data.foundDate ? res.data.foundDate.split("T")[0] : "",
        });
        setImagePreview(toAbsolute(res.data.imageUrl));
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load item");
        toast.error("Could not load item details");
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  const getFieldLabel = (fieldName) => {
    const labels = {
      description: "Description",
      foundPlace: "Found Place",
      publisherName: "Your Name",
      contactPhone: "Contact Phone",
      year: "Year",
      semester: "Semester",
      image: "Image",
    };

    return labels[fieldName] || fieldName;
  };

  const validateField = (name, value) => {
    switch (name) {
      case "description":
        if (!value.trim()) return "is required";
        if (value.trim().length <= 10) {
          return "error";
        }
        return "";

      case "foundPlace":
        if (!value.trim()) return "is required";
        return "";

      case "publisherName":
        if (!value.trim()) return "is required";
        return "";

      case "contactPhone":
        if (!value.trim()) return "is required";
        if (!/^\d+$/.test(value)) return "must contain only digits";
        if (value.length !== 10) return "error";
        return "";

      case "year":
        if (!value) return "is required";
        return "";

      case "semester":
        if (!value) return "is required";
        return "";

      case "image":
        if (!imageFile && !imagePreview) return "is required";
        return "";

      default:
        return "";
    }
  };

  const validateForm = () => {
    const errors = {
      description: validateField("description", editForm.description),
      foundPlace: validateField("foundPlace", editForm.foundPlace),
      publisherName: validateField("publisherName", editForm.publisherName),
      contactPhone: validateField("contactPhone", editForm.contactPhone),
      year: validateField("year", editForm.year),
      semester: validateField("semester", editForm.semester),
      image: validateField("image", imageFile),
    };

    setFormErrors(errors);
    return errors;
  };

  const handleInputChange = (field, value) => {
    if (field === "contactPhone") {
      value = value.replace(/\D/g, "").slice(0, 10);
    }

    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setFormErrors((prev) => ({
      ...prev,
      [field]: validateField(field, value),
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);

      setFormErrors((prev) => ({
        ...prev,
        image: "",
      }));
    } else {
      setFormErrors((prev) => ({
        ...prev,
        image: validateField("image", null),
      }));
    }
  };

  const handleEditClick = () => {
    setEditMode(true);
    setFormErrors({});
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setFormErrors({});
    setImageFile(null);
    setEditForm({
      itemName: item.itemName || "",
      description: item.description || "",
      foundPlace: item.foundPlace || "",
      publisherName: item.publisherName || "",
      contactPhone: item.contactPhone || "",
      year: item.year || "",
      semester: item.semester || "",
      foundDate: item.foundDate ? item.foundDate.split("T")[0] : "",
    });
    setImagePreview(toAbsolute(item.imageUrl));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    const errorEntries = Object.entries(errors).filter(([, message]) => message);

    if (errorEntries.length > 0) {
      const errorMessage = errorEntries
        .map(([field, message]) => `${getFieldLabel(field)}: ${message}`)
        .join(", ");

      toast.error(errorMessage);
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("itemName", editForm.itemName);
      formData.append("description", editForm.description);
      formData.append("foundPlace", editForm.foundPlace);
      formData.append("publisherName", editForm.publisherName);
      formData.append("contactPhone", editForm.contactPhone);
      formData.append("year", editForm.year);
      formData.append("semester", editForm.semester);
      formData.append("foundDate", editForm.foundDate);

      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await api.put(`/lostfound/found/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Item updated successfully!");
      setItem(res.data);
      setEditMode(false);
      setImageFile(null);
      setImagePreview(toAbsolute(res.data.imageUrl));
      setFormErrors({});
      setEditForm({
        itemName: res.data.itemName || "",
        description: res.data.description || "",
        foundPlace: res.data.foundPlace || "",
        publisherName: res.data.publisherName || "",
        contactPhone: res.data.contactPhone || "",
        year: res.data.year || "",
        semester: res.data.semester || "",
        foundDate: res.data.foundDate ? res.data.foundDate.split("T")[0] : "",
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
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
  if (!item) return null;

  return (
    <div className="found-item-detail-page">
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
                <h2 className="fancy-title">{item.itemName}</h2>
                <ul className="info-list">
                  <li><span className="emoji">🗺️</span> <span>{item.foundPlace}</span></li>
                  <li><span className="emoji">🧑‍💼</span> <span>{item.publisherName}</span></li>
                  <li><span className="emoji">📱</span> <span>{item.contactPhone || "Not provided"}</span></li>
                  <li><span className="emoji">📆</span> <span>{new Date(item.foundDate).toLocaleDateString()}</span></li>
                  <li><span className="emoji">🎓</span> <span>{item.year} – {item.semester}</span></li>
                </ul>
                <div className="desc-block">
                  <span className="emoji">📝</span>
                  <span>{item.description}</span>
                </div>
              </div>

              <div className="detail-actions">
                <button className="edit-btn modern-btn" onClick={handleEditClick}>
                  ✏️ Edit
                </button>
                <button className="delete-btn modern-btn" onClick={handleDelete}>
                  🗑️ Delete
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={handleUpdate} className="edit-form" noValidate>
              <div className="form-group">
                <label>Item Name</label>
                <input
                  type="text"
                  value={editForm.itemName}
                  disabled
                  readOnly
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows="4"
                  value={editForm.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  onBlur={(e) =>
                    setFormErrors((prev) => ({
                      ...prev,
                      description: validateField("description", e.target.value),
                    }))
                  }
                  required
                />
                {formErrors.description && (
                  <small className="validation-error">
                    Description {formErrors.description}
                  </small>
                )}
              </div>

              <div className="form-group">
                <label>Found Place</label>
                <input
                  type="text"
                  value={editForm.foundPlace}
                  onChange={(e) =>
                    handleInputChange("foundPlace", e.target.value)
                  }
                  onBlur={(e) =>
                    setFormErrors((prev) => ({
                      ...prev,
                      foundPlace: validateField("foundPlace", e.target.value),
                    }))
                  }
                  required
                />
                {formErrors.foundPlace && (
                  <small className="validation-error">
                    Found Place {formErrors.foundPlace}
                  </small>
                )}
              </div>

              <div className="form-group">
                <label>Your Name</label>
                <input
                  type="text"
                  value={editForm.publisherName}
                  onChange={(e) =>
                    handleInputChange("publisherName", e.target.value)
                  }
                  onBlur={(e) =>
                    setFormErrors((prev) => ({
                      ...prev,
                      publisherName: validateField("publisherName", e.target.value),
                    }))
                  }
                  required
                />
                {formErrors.publisherName && (
                  <small className="validation-error">
                    Your Name {formErrors.publisherName}
                  </small>
                )}
              </div>

              <div className="form-group">
                <label>Contact Phone</label>
                <input
                  type="tel"
                  value={editForm.contactPhone}
                  onChange={(e) =>
                    handleInputChange("contactPhone", e.target.value)
                  }
                  onBlur={(e) =>
                    setFormErrors((prev) => ({
                      ...prev,
                      contactPhone: validateField("contactPhone", e.target.value),
                    }))
                  }
                  maxLength={10}
                  required
                />
                {formErrors.contactPhone && (
                  <small className="validation-error">
                    Contact Phone {formErrors.contactPhone}
                  </small>
                )}
              </div>

              <div className="form-group">
                <label>Year</label>
                <select
                  value={editForm.year}
                  onChange={(e) => handleInputChange("year", e.target.value)}
                  onBlur={(e) =>
                    setFormErrors((prev) => ({
                      ...prev,
                      year: validateField("year", e.target.value),
                    }))
                  }
                  required
                >
                  <option value="">Select Year</option>
                  <option value="FIRST">First Year</option>
                  <option value="SECOND">Second Year</option>
                  <option value="THIRD">Third Year</option>
                  <option value="FOURTH">Fourth Year</option>
                </select>
                {formErrors.year && (
                  <small className="validation-error">
                    Year {formErrors.year}
                  </small>
                )}
              </div>

              <div className="form-group">
                <label>Semester</label>
                <select
                  value={editForm.semester}
                  onChange={(e) =>
                    handleInputChange("semester", e.target.value)
                  }
                  onBlur={(e) =>
                    setFormErrors((prev) => ({
                      ...prev,
                      semester: validateField("semester", e.target.value),
                    }))
                  }
                  required
                >
                  <option value="">Select Semester</option>
                  <option value="SEM1">Semester 1</option>
                  <option value="SEM2">Semester 2</option>
                </select>
                {formErrors.semester && (
                  <small className="validation-error">
                    Semester {formErrors.semester}
                  </small>
                )}
              </div>

              <div className="form-group">
                <label>Date Found</label>
                <input
                  type="date"
                  name="foundDate"
                  value={editForm.foundDate}
                  disabled
                  readOnly
                />
              </div>

              <div className="form-group">
                <label>Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {formErrors.image && (
                  <small className="validation-error">
                    Image {formErrors.image}
                  </small>
                )}
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
                <button type="button" onClick={handleCancelEdit}>
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