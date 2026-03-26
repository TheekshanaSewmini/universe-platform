import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import api from "../api/axios";

export default function MySubjects() {
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", code: "", description: "", courseId: "" });
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchSubjects = useCallback(async () => {
    try {
      const res = await api.get("/materials/subjects/my", {
        params: { courseId: selectedCourseId }
      });
      setSubjects(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load subjects");
    }
  }, [selectedCourseId]);

  useEffect(() => {
    if (selectedCourseId) fetchSubjects();
    else setSubjects([]);
  }, [selectedCourseId, fetchSubjects]);

  useEffect(() => {
    setForm(prev => ({ ...prev, courseId: selectedCourseId }));
  }, [selectedCourseId]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = form.name.trim();
    const code = form.code.trim();

    if (!name) {
      toast.error("Subject name is required");
      return;
    }
    if (name.length < 3) {
      toast.error("Subject name must be at least 3 characters");
      return;
    }
    if (form.description.trim().length < 10) {
      toast.error("Description must be at least 10 characters");
      return;
    }
    if (!form.courseId) {
      toast.error("Please select a course");
      return;
    }
    if (code && code.length < 3) {
      toast.error("Subject code must be at least 3 characters");
      return;
    }
    if (code && !/^[A-Z]{2,6}\d{2,4}$/.test(code)) {
      toast.error("Subject code must contain uppercase letters then digits, e.g. CS101 or PHY202");
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        const res = await api.put(`/materials/subjects/update/${editingId}`, form);
        toast.success("Subject updated");
        setSubjects(subjects.map(s => s.id === editingId ? res.data : s));
        setEditingId(null);
      } else {
        const res = await api.post("/materials/subjects/create", form);
        toast.success("Subject created");
        setSubjects([res.data, ...subjects]);
      }
      setForm({ name: "", code: "", description: "", courseId: selectedCourseId });
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (subject) => {
    setForm({
      name: subject.name,
      code: subject.code,
      description: subject.description,
      courseId: subject.courseId,
    });
    setEditingId(subject.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this subject? All materials will be removed.")) return;
    try {
      await api.delete(`/materials/subjects/delete/${id}`);
      toast.success("Subject deleted");
      setSubjects(subjects.filter(s => s.id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  if (loading) return <div className="loading-spinner">Loading courses...</div>;

  return (
    <div className="manager-card">
      <h2>My Subjects</h2>
      <div className="filter">
        <label>Select Course:</label>
        <select value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)}>
          <option value="">-- Choose a course --</option>
          {courses.map(c => (
            <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
          ))}
        </select>
      </div>

      {selectedCourseId && (
        <>
          <form onSubmit={handleSubmit} className="form-inline">
            <input
              type="text"
              placeholder="Subject name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Subject code (optional)"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
            />
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows="2"
            />
            <button type="submit" disabled={submitting}>
              {editingId ? "Update" : "Create"}
            </button>
            {editingId && (
              <button type="button" onClick={() => {
                setEditingId(null);
                setForm({ name: "", code: "", description: "", courseId: selectedCourseId });
              }}>
                Cancel
              </button>
            )}
          </form>

          <div className="items-grid">
            {subjects.map(subject => (
              <div key={subject.id} className="item-card">
                <div className="item-header">
                  <h3>{subject.name}</h3>
                  {subject.code && <span className="badge">{subject.code}</span>}
                </div>
                <p className="description">{subject.description || "No description"}</p>
                <div className="item-actions">
                  <button className="edit-btn" onClick={() => handleEdit(subject)}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDelete(subject.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}