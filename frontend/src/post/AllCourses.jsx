import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../api/axios";

const AllCourses = () => {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const response = await api.get("/materials/courses/list");
      setCourses(response.data);
    } catch (error) {
      toast.error("Failed to load courses");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="loading-spinner">Loading courses...</div>;
  }

  return (
      <div className="manager-card">
        <h2>All Courses</h2>

        <div className="items-grid">
          {courses.length > 0 ? (
              courses.map((course) => (
                  <div key={course.id} className="item-card">
                    <div className="item-header">
                      <h3>{course.name}</h3>
                      <span className="badge">
                  {course.code ? course.code : "No code"}
                </span>
                    </div>

                    <p className="description">
                      {course.description ? course.description : "No description"}
                    </p>
                  </div>
              ))
          ) : (
              <p>No courses available</p>
          )}
        </div>
      </div>
  );
};

export default AllCourses;