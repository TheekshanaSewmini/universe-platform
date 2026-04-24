import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../api/axios";

const DEFAULT_FORM = {
  name: "",
  code: "",
  description: "",
};

export default function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [formState, setFormState] = useState(DEFAULT_FORM);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const { data } = await api.get("/materials/courses/my");
      setCourses(data);
    } catch {
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const handleInput = (field) => (e) => {
    setFormState((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const reset = () => {
    setFormState(DEFAULT_FORM);
    setEditingCourseId(null);
  };

  const validate = () => {
    const name = formState.name.trim();
    const code = formState.code.trim();
    const desc = formState.description.trim();

    if (!name) return toast.error("Course name is required"), false;
    if (name.length < 3) return toast.error("Minimum 3 characters required"), false;
    if (desc.length < 10) return toast.error("Description too short"), false;

    if (code) {
      if (code.length < 3) return toast.error("Invalid code length"), false;
      if (!/^[A-Z]{2,6}\d{2,4}$/.test(code))
        return toast.error("Invalid format (e.g. CS101)"), false;
    }

    return true;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setProcessing(true);

    try {
      let response;

      if (editingCourseId) {
        response = await api.put(
            `/materials/courses/update/${editingCourseId}`,
            formState
        );

        setCourses((prev) =>
            prev.map((c) => (c.id === editingCourseId ? response.data : c))
        );

        toast.success("Course updated");
      } else {
        response = await api.post("/materials/courses/create", formState);

        setCourses((prev) => [response.data, ...prev]);

        toast.success("Course created");
      }

      reset();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setProcessing(false);
    }
  };

  const editCourse = (course) => {
    setEditingCourseId(course.id);
    setFormState({
      name: course.name || "",
      code: course.code || "",
      description: course.description || "",
    });
  };

  const removeCourse = async (id) => {
    if (!window.confirm("Delete this course? All related data will be removed.")) return;

    try {
      await api.delete(`/materials/courses/delete/${id}`);
      setCourses((prev) => prev.filter((c) => c.id !== id));
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

        <form onSubmit={submit} className="form-inline">
          <input
              type="text"
              placeholder="Course name"
              value={formState.name}
              onChange={handleInput("name")}
              required
          />

          <input
              type="text"
              placeholder="Course code (e.g., CS101)"
              value={formState.code}
              onChange={handleInput("code")}
          />

          <textarea
              placeholder="Description"
              value={formState.description}
              onChange={handleInput("description")}
              rows="2"
          />

          <button type="submit" disabled={processing}>
            {editingCourseId ? "Update" : "Create"}
          </button>

          {editingCourseId && (
              <button type="button" onClick={reset}>
                Cancel
              </button>
          )}
        </form>

        <div className="items-grid">
          {courses.map((course) => (
              <div key={course.id} className="item-card">
                <div className="item-header">
                  <h3>{course.name}</h3>
                  <span className="badge">{course.code || "No code"}</span>
                </div>

                <p className="description">
                  {course.description || "No description"}
                </p>

                <div className="item-actions">
                  <button onClick={() => editCourse(course)}>Edit</button>
                  <button className="delete-btn" onClick={() => removeCourse(course.id)}>
                    Delete
                  </button>
                </div>
              </div>
          ))}
        </div>
      </div>
  );
}