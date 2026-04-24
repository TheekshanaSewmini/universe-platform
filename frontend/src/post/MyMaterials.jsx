import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../api/axios";

const INITIAL_FORM = {
  name: "",
  code: "",
  description: "",
};

const MyCourses = () => {
  const [courseList, setCourseList] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [editId, setEditId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      const res = await api.get("/materials/courses/my");
      setCourseList(res.data);
    } catch (err) {
      toast.error("Failed to load courses");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const clearForm = () => {
    setForm(INITIAL_FORM);
    setEditId(null);
  };

  const isValid = () => {
    const name = form.name.trim();
    const code = form.code.trim();
    const desc = form.description.trim();

    if (!name) return toast.error("Course name is required"), false;
    if (name.length < 3) return toast.error("Course name must be at least 3 characters"), false;
    if (desc.length < 10) return toast.error("Description must be at least 10 characters"), false;

    if (code) {
      if (code.length < 3) return toast.error("Course code must be at least 3 characters"), false;
      if (!/^[A-Z]{2,6}\d{2,4}$/.test(code))
        return toast.error("Invalid code format (e.g. CS101)"), false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid()) return;

    setIsSubmitting(true);

    try {
      if (editId) {
        const { data } = await api.put(`/materials/courses/update/${editId}`, form);
        setCourseList(prev => prev.map(c => (c.id === editId ? data : c)));
        toast.success("Course updated");
      } else {
        const { data } = await api.post("/materials/courses/create", form);
        setCourseList(prev => [data, ...prev]);
        toast.success("Course created");
      }

      clearForm();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onEdit = (course) => {
    setEditId(course.id);
    setForm({
      name: course.name || "",
      code: course.code || "",
      description: course.description || "",
    });
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this course? All subjects and materials will be removed.")) return;

    try {
      await api.delete(`/materials/courses/delete/${id}`);
      setCourseList(prev => prev.filter(c => c.id !== id));
      toast.success("Course deleted");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  if (isLoading) return <div className="loading-spinner">Loading courses...</div>;

  return (
      <div className="manager-card">
        <h2>My Courses</h2>

        <form onSubmit={handleSubmit} className="form-inline">
          <input
              type="text"
              placeholder="Course name"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
          />

          <input
              type="text"
              placeholder="Course code (e.g., CS101)"
              value={form.code}
              onChange={(e) => handleChange("code", e.target.value)}
          />

          <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows="2"
          />

          <button type="submit" disabled={isSubmitting}>
            {editId ? "Update" : "Create"}
          </button>

          {editId && (
              <button type="button" onClick={clearForm}>
                Cancel
              </button>
          )}
        </form>

        <div className="items-grid">
          {courseList.map((course) => (
              <div key={course.id} className="item-card">
                <div className="item-header">
                  <h3>{course.name}</h3>
                  <span className="badge">{course.code || "No code"}</span>
                </div>

                <p className="description">
                  {course.description || "No description"}
                </p>

                <div className="item-actions">
                  <button className="edit-btn" onClick={() => onEdit(course)}>
                    Edit
                  </button>

                  <button className="delete-btn" onClick={() => onDelete(course.id)}>
                    Delete
                  </button>
                </div>
              </div>
          ))}
        </div>
      </div>
  );
};

export default MyCourses;