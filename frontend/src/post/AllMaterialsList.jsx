import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../api/axios";
import VersionModal from "./VersionModal";

export default function AllMaterialsList() {
  const [materials, setMaterials] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [loading, setLoading] = useState(true);
  const [versionModalOpen, setVersionModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  const backendBaseUrl = api.defaults.baseURL || "";
  const toAbsolute = (url) =>
    url ? (url.startsWith("http") ? url : backendBaseUrl + url) : null;

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId) fetchSubjects();
    else setSubjects([]);
  }, [selectedCourseId]);

  useEffect(() => {
    if (selectedSubjectId) fetchMaterials();
  }, [selectedSubjectId]);

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
      setSelectedSubjectId("");
    } catch (err) {
      toast.error("Failed to load subjects");
    }
  };

  const fetchMaterials = async () => {
    try {
      const res = await api.get("/materials/mlist", {
        params: { subjectId: selectedSubjectId }
      });
      setMaterials(res.data);
    } catch (err) {
      toast.error("Failed to load materials");
    }
  };

  const openVersionModal = (material) => {
    setSelectedMaterial(material);
    setVersionModalOpen(true);
  };

  if (loading) return <div className="loading-spinner">Loading courses...</div>;

  return (
    <div className="manager-card">
      <h2>Materials</h2>
      <div className="filter">
        <label>Select Course:</label>
        <select value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)}>
          <option value="">-- Choose a course --</option>
          {courses.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {selectedCourseId && (
        <div className="filter">
          <label>Select Subject:</label>
          <select value={selectedSubjectId} onChange={(e) => setSelectedSubjectId(e.target.value)}>
            <option value="">-- Choose a subject --</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      )}

      {selectedSubjectId && (
        <div className="items-grid">
          {materials.map(material => (
            <div key={material.id} className="item-card">
              <div className="item-header">
                <h3>{material.title}</h3>
                <span className="badge-type">{material.type}</span>
              </div>
              <p className="description">{material.description || "No description"}</p>
              <div className="material-meta">
                <span>Visibility: {material.visibility}</span>
                <span>Version: {material.version}</span>
              </div>
              {material.fileUrl && (
                <div className="material-link">
                  <a href={toAbsolute(material.fileUrl)} target="_blank" rel="noopener noreferrer">
                    📄 Download file
                  </a>
                </div>
              )}
              <div className="item-actions">
                <button className="versions-btn" onClick={() => openVersionModal(material)}>
                  📜 Versions
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {versionModalOpen && (
        <VersionModal
          material={selectedMaterial}
          onClose={() => setVersionModalOpen(false)}
          readOnly={true}
        />
      )}
    </div>
  );
}