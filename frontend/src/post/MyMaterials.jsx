import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./MaterialsManagement.css";
import Navbar from "../components/Navbar";
import MyCourses from "./MyCourses";
import MySubjects from "./MySubjects";
import MyMaterialsList from "./MyMaterialsList";

export default function MyMaterials() {
  const [activeTab, setActiveTab] = useState("courses");
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/user/me", { withCredentials: true });
        setCurrentUser(res.data);
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  if (loading) return <div className="loading-spinner">Loading user...</div>;

  return (
    <div className="materials-page"><Navbar />
      <div className="container">
        <div className="page-header">
          <h1>📚 My Materials</h1>
          <p>Manage your courses, subjects, and materials</p>
        </div>

        <div className="tabs">
          <button
            className={activeTab === "courses" ? "active" : ""}
            onClick={() => setActiveTab("courses")}
          >
            📖 Courses
          </button>
          <button
            className={activeTab === "subjects" ? "active" : ""}
            onClick={() => setActiveTab("subjects")}
          >
            📚 Subjects
          </button>
          <button
            className={activeTab === "materials" ? "active" : ""}
            onClick={() => setActiveTab("materials")}
          >
            📄 Materials
          </button>
        </div>

        <div className="tab-content">
          {activeTab === "courses" && <MyCourses currentUser={currentUser} />}
          {activeTab === "subjects" && <MySubjects currentUser={currentUser} />}
          {activeTab === "materials" && <MyMaterialsList currentUser={currentUser} />}
        </div>
      </div>
    </div>
  );
}

