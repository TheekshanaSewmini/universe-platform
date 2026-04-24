import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../api/axios";

const FORM_INIT = {
  name: "",
  code: "",
  description: "",
};

const MyCourses = () => {
  const [list, setList] = useState([]);
  const [form, setForm] = useState(FORM_INIT);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get("/materials/courses/my");
      setList(res.data);
    } catch {
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(FORM_INIT);
    setEditingId(null);
  };

  const validate = () => {
    const name = form.name.trim();
    const code = form.code.trim();
    const desc = form.description.trim();

    if (!name) return toast.error("Course name is required"), false;
    if (name.length < 3) return toast.error("Minimum 3 characters"), false;
    if (desc.length < 10) return toast.error("Description too short"), false;

    if (code) {
      if (code.length < 3) return toast.error("Invalid code length"), false;
      if (!/^[A-Z]{2,6}\d{2,4}$/.test(code))
        return toast.error("Invalid code format"), false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setBusy(true);

    try {
      let res;

      if (editingId) {
        res = await api.put(`/materials/courses/update/${editingId}`, form);

        setList((prev) =>
            prev.map((c) => (c.id === editingId ? res.data : c))
        );

        toast.success("Course updated");
      } else {
        res = await api.post("/materials/courses/create", form);

        setList((prev) => [res.data, ...prev]);

        toast.success("Course created");
      }

      resetForm();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setBusy(false);
    }
  };

  const handleEdit = (c) => {
    setEditingId(c.id);
    setForm({
      name: c.name || "",
      code: c.code || "",
      description: c.description || "",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this course? All related data will be removed.")) return;

    try {
      await api.delete(`/materials/courses/delete/${id}`);
      setList((prev) => prev.filter((c) => c.id !== id));
      toast.success("Course deleted");
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
              name="name"
              value={form.name}
              onChange={onChange}
              placeholder="Course name"
              required
          />

          <input
              name="code"
              value={form.code}
              onChange={onChange}
              placeholder="Course code (e.g., CS101)"
          />

          <textarea
              name="description"
              value={form.description}
              onChange={onChange}
              placeholder="Description"
              rows="2"
          />

          <button type="submit" disabled={busy}>
            {editingId ? "Update" : "Create"}
          </button>

          {editingId && (
              <button type="button" onClick={resetForm}>
                Cancel
              </button>
          )}
        </form>

        <div className="items-grid">
          {list.map((c) => (
              <div key={c.id} className="item-card">
                <div className="item-header">
                  <h3>{c.name}</h3>
                  <span className="badge">{c.code || "No code"}</span>
                </div>

                <p className="description">
                  {c.description || "No description"}
                </p>

                <div className="item-actions">
                  <button onClick={() => handleEdit(c)}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDelete(c.id)}>
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