import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../api/axios";

export default function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", code: "", description: "" });
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await api.get("/materials/courses/my");
      setCourses(res.data);
    } catch (err) {
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
      toast.error("Course name is required");
      return;
    }
    if (name.length < 3) {
      toast.error("Course name must be at least 3 characters");
      return;
    }
    if (form.description.trim().length < 10) {
      toast.error("Description must be at least 10 characters");
      return;
    }
    if (code && code.length < 3) {
      toast.error("Course code must be at least 3 characters");
      return;
    }
    if (code && !/^[A-Z]{2,6}\d{2,4}$/.test(code)) {
      toast.error("Course code must contain uppercase letters then digits, e.g. CS101 or MAT202");
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        const res = await api.put(`/materials/courses/update/${editingId}`, form);
        toast.success("Course updated");
        setCourses(courses.map(c => c.id === editingId ? res.data : c));
        setEditingId(null);
      } else {
        const res = await api.post("/materials/courses/create", form);
        toast.success("Course created");
        setCourses([res.data, ...courses]);
      }
      setForm({ name: "", code: "", description: "" });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (course) => {
    setForm({ name: course.name, code: course.code, description: course.description });
    setEditingId(course.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this course? All subjects and materials will be removed.")) return;
    try {
      await api.delete(`/materials/courses/delete/${id}`);
      toast.success("Course deleted");
      setCourses(courses.filter(c => c.id !== id));
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  if (loading) return <div className="loading-spinner">Loading courses...</div>;

  return (
    <div className="manager-card">
      <h2>My Courses</h2>
      <form onSubmit={handleSubmit} className="form-inline">
        <input
          type="text"
          placeholder="Course name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Course code (e.g., CS101)"
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
          <button type="button" onClick={() => { setEditingId(null); setForm({ name: "", code: "", description: "" }); }}>
            Cancel
          </button>
        )}
      </form>

      <div className="items-grid">
        {courses.map(course => (
          <div key={course.id} className="item-card">
            <div className="item-header">
              <h3>{course.name}</h3>
              <span className="badge">{course.code || "No code"}</span>
            </div>
            <p className="description">{course.description || "No description"}</p>
            <div className="item-actions">
              <button className="edit-btn" onClick={() => handleEdit(course)}>Edit</button>
              <button className="delete-btn" onClick={() => handleDelete(course.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}



