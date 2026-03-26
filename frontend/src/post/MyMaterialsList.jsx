import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../api/axios";
import VersionModal from "./VersionModal";

export default function MyMaterialsList() {
  const [materials, setMaterials] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "NOTE",
    visibility: "PUBLIC",
    subjectId: "",
  });
  const [file, setFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [versionModalOpen, setVersionModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  const backendBaseUrl = api.defaults.baseURL || "";
  const toAbsolute = (url) =>
    url ? (url.startsWith("http") ? url : backendBaseUrl + url) : null;

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId) fetchSubjects();
    else setSubjects([]);
  }, [selectedCourseId]);

  useEffect(() => {
    setForm(prev => ({ ...prev, subjectId: selectedSubjectId }));
  }, [selectedSubjectId]);

  useEffect(() => {
    if (selectedSubjectId) fetchMaterials();
  }, [selectedSubjectId]);

  const fetchCourses = async () => {
    try {
      const res = await api.get("/materials/courses/my");
      setCourses(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await api.get("/materials/subjects/my", {
        params: { courseId: selectedCourseId }
      });
      setSubjects(res.data);
      setSelectedSubjectId("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to load subjects");
    }
  };

  const fetchMaterials = async () => {
    try {
      const res = await api.get("/materials/mmy", {
        params: { subjectId: selectedSubjectId }
      });
      setMaterials(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load materials");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const title = form.title.trim();
    const description = form.description.trim();

    if (!title) {
      toast.error("Title is required");
      return;
    }
    if (title.length < 3) {
      toast.error("Title must be at least 3 characters");
      return;
    }
    if (!description || description.length < 10) {
      toast.error("Description must be at least 10 characters");
      return;
    }
    if (!form.subjectId) {
      toast.error("Please select a subject");
      return;
    }
    if (form.type === "PDF" && !file && !editingId) {
      toast.error("Please upload a file for PDF material");
      return;
    }
    if (file) {
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp", "image/gif"];
      if (!allowedTypes.includes(file.type)) {
        toast.error("File must be PDF or image (jpg/png/webp/gif)");
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        toast.error("File must be less than 20MB");
        return;
      }
    }
    setSubmitting(true);
    try {
      if (editingId) {
        const payload = {
          title: form.title,
          description: form.description,
          type: form.type,
          visibility: form.visibility,
        };
        const res = await api.put(`/materials/mupdate/${editingId}`, payload);
        toast.success("Material updated");
        setMaterials(materials.map(m => m.id === editingId ? res.data : m));
        setEditingId(null);
      } else {
        const formData = new FormData();
        formData.append("title", form.title);
        formData.append("description", form.description);
        formData.append("type", form.type);
        formData.append("visibility", form.visibility);
        formData.append("subjectId", form.subjectId);
        if (file) formData.append("file", file);
        const res = await api.post("/materials/mcreate", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Material created");
        setMaterials([res.data, ...materials]);
      }
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      type: "NOTE",
      visibility: "PUBLIC",
      subjectId: selectedSubjectId,
    });
    setFile(null);
    setEditingId(null);
  };

  const handleEdit = (material) => {
    setForm({
      title: material.title,
      description: material.description,
      type: material.type,
      visibility: material.visibility,
      subjectId: material.subjectId,
    });
    setEditingId(material.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this material? All versions will be removed.")) return;
    try {
      await api.delete(`/materials/mdelete/${id}`);
      toast.success("Material deleted");
      setMaterials(materials.filter(m => m.id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const openVersionModal = (material) => {
    setSelectedMaterial(material);
    setVersionModalOpen(true);
  };

  if (loading) {
    return <div className="loading-spinner">Loading materials...</div>;
  }

  return (
    <div className="manager-card">
      <h2>My Materials</h2>
      <div className="filter">
        <label>Select Course:</label>
        <select value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)}>
          <option value="">-- Choose a course --</option>
          {courses.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {selectedCourseId && (
        <div className="filter">
          <label>Select Subject:</label>
          <select value={selectedSubjectId} onChange={(e) => setSelectedSubjectId(e.target.value)}>
            <option value="">-- Choose a subject --</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      )}

      {selectedSubjectId && (
        <>
          <form onSubmit={handleSubmit} className="material-form">
            <input
              type="text"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows="2"
            />
            <div className="form-row">
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="NOTE">Note</option>
                <option value="PDF">PDF</option>
                <option value="VIDEO">Video</option>
                <option value="OTHER">Other</option>
              </select>
              <select value={form.visibility} onChange={(e) => setForm({ ...form, visibility: e.target.value })}>
                <option value="PUBLIC">Public</option>
                <option value="PRIVATE">Private</option>
              </select>
            </div>
            {!editingId && (
              <div className="file-input">
                <label htmlFor="material-file">📎 Upload file (PDF, image, etc.)</label>
                <input
                  type="file"
                  id="material-file"
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </div>
            )}
            <div className="form-actions">
              <button type="submit" disabled={submitting}>
                {editingId ? "Update" : "Create"}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm}>Cancel</button>
              )}
            </div>
          </form>

          <div className="items-grid">
            {materials.map(material => (
              <div key={material.id} className="item-card">
                <div className="item-header">
                  <h3>{material.title}</h3>
                  <span className="badge-type">{material.type}</span>
                </div>
                <p className="description">{material.description || "No description"}</p>
                <div className="material-meta">
                  <span>Visibility: {material.visibility}</span>
                  <span>Version: {material.version}</span>
                </div>
                {material.fileUrl && (
                  <div className="material-link">
                    <a href={toAbsolute(material.fileUrl)} target="_blank" rel="noopener noreferrer">
                      📄 Download file
                    </a>
                  </div>
                )}
                <div className="item-actions">
                  <button className="edit-btn" onClick={() => handleEdit(material)}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDelete(material.id)}>Delete</button>
                  <button className="versions-btn" onClick={() => openVersionModal(material)}>📜 Versions</button>
                </div>
              </div>
            ))}
          </div>

          {versionModalOpen && (
            <VersionModal
              material={selectedMaterial}
              onClose={() => setVersionModalOpen(false)}
              currentUser={currentUser}
            />
          )}
        </>
      )}
    </div>
  );
}