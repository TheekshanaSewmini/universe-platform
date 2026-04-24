import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../api/axios";

export default function AllCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCourses();
  }, []);

  const getCourses = async () => {
    try {
      const { data } = await api.get("/materials/courses/list");
      setCourses(data);
    } catch (e) {
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const renderCourses = () => {
    if (courses.length === 0) {
      return <p>No courses available</p>;
    }

    return courses.map(({ id, name, code, description }) => (
        <div key={id} className="item-card">
          <div className="item-header">
            <h3>{name}</h3>
            <span className="badge">{code || "No code"}</span>
          </div>

          <p className="description">
            {description || "No description"}
          </p>
        </div>
    ));
  };

  if (loading) {
    return <div className="loading-spinner">Loading courses...</div>;
  }

  return (
      <div className="manager-card">
        <h2>All Courses</h2>
        <div className="items-grid">{renderCourses()}</div>
      </div>
  );
}