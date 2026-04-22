import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../api/axios";

export default function AllSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId) fetchSubjects();
    else setSubjects([]);
  }, [selectedCourseId]);

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

  const fetchSubjects = async () => {
    try {
      const res = await api.get(`/materials/subjects/list?courseId=${selectedCourseId}`);
      setSubjects(res.data);
    } catch (err) {
      toast.error("Failed to load subjects");
    }
  };

  if (loading) return <div className="loading-spinner">Loading courses...</div>;

  return (
    <div className="manager-card">
      <h2>Subjects</h2>
      <div className="filter">
        <label>Select Course:</label>
        <select value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)}>
          <option value="">-- Choose a course --</option>
          {courses.map(c => (
            <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
          ))}
        </select>
      </div>

      {selectedCourseId && (
        <div className="items-grid">
          {subjects.map(subject => (
            <div key={subject.id} className="item-card">
              <div className="item-header">
                <h3>{subject.name}</h3>
                {subject.code && <span className="badge">{subject.code}</span>}
              </div>
              <p className="description">{subject.description || "No description"}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}



