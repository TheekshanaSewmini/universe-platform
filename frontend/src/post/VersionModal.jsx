import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../api/axios";

const INITIAL_VALUES = {
  name: "",
  code: "",
  description: "",
};

export default function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [values, setValues] = useState(INITIAL_VALUES);
  const [courseId, setCourseId] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    getMyCourses();
  }, []);

  const getMyCourses = async () => {
    try {
      const { data } = await api.get("/materials/courses/my");
      setCourses(data);
    } catch (error) {
      toast.error("Failed to load courses");
    } finally {
      setPageLoading(false);
    }
  };

  const changeValue = ({ target }) => {
    setValues((oldValues) => ({
      ...oldValues,
      [target.name]: target.value,
    }));
  };

  const clearValues = () => {
    setValues(INITIAL_VALUES);
    setCourseId(null);
  };

  const checkForm = () => {
    const courseName = values.name.trim();
    const courseCode = values.code.trim();
    const courseDescription = values.description.trim();

    if (!courseName) {
      toast.error("Course name is required");
      return false;
    }

    if (courseName.length < 3) {
      toast.error("Minimum 3 characters");
      return false;
    }

    if (courseDescription.length < 10) {
      toast.error("Description too short");
      return false;
    }

    if (courseCode && courseCode.length < 3) {
      toast.error("Invalid code length");
      return false;
    }

    if (courseCode && !/^[A-Z]{2,6}\d{2,4}$/.test(courseCode)) {
      toast.error("Invalid code format");
      return false;
    }

    return true;
  };

  const saveCourse = async (event) => {
    event.preventDefault();

    if (!checkForm()) return;

    setSubmitLoading(true);

    try {
      if (courseId) {
        const { data } = await api.put(
            `/materials/courses/update/${courseId}`,
            values
        );

        setCourses((oldCourses) =>
            oldCourses.map((course) => (course.id === courseId ? data : course))
        );

        toast.success("Course updated");
      } else {
        const { data } = await api.post("/materials/courses/create", values);

        setCourses((oldCourses) => [data, ...oldCourses]);

        toast.success("Course created");
      }

      clearValues();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setSubmitLoading(false);
    }
  };

  const fillFormForEdit = (course) => {
    setCourseId(course.id);
    setValues({
      name: course.name || "",
      code: course.code || "",
      description: course.description || "",
    });
  };

  const deleteCourse = async (id) => {
    const shouldDelete = window.confirm(
        "Delete this course? All related data will be removed."
    );

    if (!shouldDelete) return;

    try {
      await api.delete(`/materials/courses/delete/${id}`);

      setCourses((oldCourses) =>
          oldCourses.filter((course) => course.id !== id)
      );

      toast.success("Course deleted");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Delete failed");
    }
  };

  if (pageLoading) {
    return <div className="loading-spinner">Loading courses...</div>;
  }

  return (
      <div className="manager-card">
        <h2>My Courses</h2>

        <form className="form-inline" onSubmit={saveCourse}>
          <input
              name="name"
              placeholder="Course name"
              value={values.name}
              onChange={changeValue}
              required
          />

          <input
              name="code"
              placeholder="Course code (e.g., CS101)"
              value={values.code}
              onChange={changeValue}
          />

          <textarea
              name="description"
              placeholder="Description"
              rows="2"
              value={values.description}
              onChange={changeValue}
          />

          <button type="submit" disabled={submitLoading}>
            {courseId ? "Update" : "Create"}
          </button>

          {courseId && (
              <button type="button" onClick={clearValues}>
                Cancel
              </button>
          )}
        </form>

        <div className="items-grid">
          {courses.map((course) => (
              <div className="item-card" key={course.id}>
                <div className="item-header">
                  <h3>{course.name}</h3>
                  <span className="badge">{course.code || "No code"}</span>
                </div>

                <p className="description">
                  {course.description || "No description"}
                </p>

                <div className="item-actions">
                  <button onClick={() => fillFormForEdit(course)}>Edit</button>
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