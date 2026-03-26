import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../api/axios";

export default function AllCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await api.get("/materials/courses/list");
      setCourses(res.data);
    } catch (err) {
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-spinner">Loading courses...</div>;

  return (
    <div className="manager-card">
      <h2>All Courses</h2>
      <div className="items-grid">
        {courses.map(course => (
          <div key={course.id} className="item-card">
            <div className="item-header">
              <h3>{course.name}</h3>
              <span className="badge">{course.code || "No code"}</span>
            </div>
            <p className="description">{course.description || "No description"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}