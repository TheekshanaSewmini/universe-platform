import { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./MaterialsManagement.css";
import Navbar from "../components/Navbar";
import AllCourses from "./AllCourses";
import AllSubjects from "./AllSubjects";
import AllMaterialsList from "./AllMaterialsList";

export default function AllMaterials() {
  const [activeTab, setActiveTab] = useState("courses");

  return (
    <div className="materials-page">
      <ToastContainer position="top-right" autoClose={3000} />
      <Navbar />
      <div className="container">
        <div className="page-header">
          <h1>📚 All Materials</h1>
          <p>Browse courses, subjects, and learning materials</p>
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
          {activeTab === "courses" && <AllCourses />}
          {activeTab === "subjects" && <AllSubjects />}
          {activeTab === "materials" && <AllMaterialsList />}
        </div>
      </div>
    </div>
  );
}