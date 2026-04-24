import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../api/axios";

export default function AllCourses() {
  const [courses, setCourses] = useState([]);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    loadAllCourses();
  }, []);

  const loadAllCourses = async () => {
    try {
      const response = await api.get("/materials/courses/list");
      setCourses(response.data);
    } catch (error) {
      toast.error("Failed to load courses");
    } finally {
      setIsFetching(false);
    }
  };

  const hasCourses = courses.length > 0;

  if (isFetching) {
    return <div className="loading-spinner">Loading courses...</div>;
  }

  return (
      <div className="manager-card">
        <h2>All Courses</h2>

        <div className="items-grid">
          {!hasCourses ? (
              <p>No courses available</p>
          ) : (
              courses.map((course) => {
                const { id, name, code, description } = course;

                return (
                    <div key={id} className="item-card">
                      <div className="item-header">
                        <h3>{name}</h3>
                        <span className="badge">{code || "No code"}</span>
                      </div>

                      <p className="description">
                        {description || "No description"}
                      </p>
                    </div>
                );
              })
          )}
        </div>
      </div>
  );
}