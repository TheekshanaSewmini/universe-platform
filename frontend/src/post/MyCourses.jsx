import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../api/axios";

const emptyCourseForm = {
  name: "",
  code: "",
  description: "",
};

export default function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState(emptyCourseForm);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadMyCourses();
  }, []);

  const loadMyCourses = async () => {
    try {
      const { data } = await api.get("/materials/courses/my");
      setCourses(data);
    } catch (error) {
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setFormData(emptyCourseForm);
    setSelectedCourseId(null);
  };

  const validateCourse = () => {
    const name = formData.name.trim();
    const code = formData.code.trim();
    const description = formData.description.trim();

    if (!name) {
      toast.error("Course name is required");
      return false;
    }

    if (name.length < 3) {
      toast.error("Course name must be at least 3 characters");
      return false;
    }

    if (description.length < 10) {
      toast.error("Description must be at least 10 characters");
      return false;
    }

    if (code && code.length < 3) {
      toast.error("Course code must be at least 3 characters");
      return false;
    }

    if (code && !/^[A-Z]{2,6}\d{2,4}$/.test(code)) {
      toast.error("Course code must contain uppercase letters then digits, e.g. CS101 or MAT202");
      return false;
    }

    return true;
  };

  const saveCourse = async (event) => {
    event.preventDefault();

    if (!validateCourse()) return;

    setSaving(true);

    try {
      if (selectedCourseId) {
        const { data } = await api.put(
            `/materials/courses/update/${selectedCourseId}`,
            formData
        );

        setCourses((currentCourses) =>
            currentCourses.map((course) =>
                course.id === selectedCourseId ? data : course
            )
        );

        toast.success("Course updated");
      } else {
        const { data } = await api.post("/materials/courses/create", formData);

        setCourses((currentCourses) => [data, ...currentCourses]);

        toast.success("Course created");
      }

      resetForm();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (course) => {
    setSelectedCourseId(course.id);
    setFormData({
      name: course.name || "",
      code: course.code || "",
      description: course.description || "",
    });
  };

  const deleteCourse = async (courseId) => {
    const confirmed = window.confirm(
        "Delete this course? All subjects and materials will be removed."
    );

    if (!confirmed) return;

    try {
      await api.delete(`/materials/courses/delete/${courseId}`);

      setCourses((currentCourses) =>
          currentCourses.filter((course) => course.id !== courseId)
      );

      toast.success("Course deleted");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Delete failed");
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading courses...</div>;
  }

  return (
      <div className="manager-card">
        <h2>My Courses</h2>

        <form onSubmit={saveCourse} className="form-inline">
          <input
              type="text"
              placeholder="Course name"
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
              required
          />

          <input
              type="text"
              placeholder="Course code (e.g., CS101)"
              value={formData.code}
              onChange={(e) => updateField("code", e.target.value)}
          />

          <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              rows="2"
          />

          <button type="submit" disabled={saving}>
            {selectedCourseId ? "Update" : "Create"}
          </button>

          {selectedCourseId && (
              <button type="button" onClick={resetForm}>
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
                  <button className="edit-btn" onClick={() => startEdit(course)}>
                    Edit
                  </button>

                  <button
                      className="delete-btn"
                      onClick={() => deleteCourse(course.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
          ))}
        </div>
      </div>
  );
}