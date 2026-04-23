import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../api/axios";

const MAX_UPLOAD_BYTES = 100 * 1024 * 1024;

const toAbsolute = (url) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  const base = api.defaults.baseURL || "";
  return `${base}${url}`;
};

const getUserId = (user) => {
  return user?.userId ?? user?.id ?? user?.userID ?? user?.user_id ?? null;
};

const formatBytes = (bytes) => {
  if (bytes === null || bytes === undefined) return "";
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  const precision = value >= 10 || unitIndex === 0 ? 0 : 1;
  return `${value.toFixed(precision)} ${units[unitIndex]}`;
};

const formatDate = (value) => {
  if (!value) return "Unknown date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return date.toLocaleString();
};

export default function VersionModal({ material, onClose, currentUser }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (!material?.id) return;
    setVersions([]);
    setError("");
    setNotes("");
    setFile(null);
    setLoading(true);
    fetchVersions(material.id);
  }, [material?.id]);

  const fetchVersions = async (materialId) => {
    try {
      const res = await api.get(`/materials/mversions/list/${materialId}`);
      setVersions(res.data || []);
    } catch (err) {
      const message = err.response?.data?.message || "Failed to load versions";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVersion = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please choose a file");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      toast.error("File must be less than 100MB");
      return;
    }
    const fileType = file.type || "";
    const isPdf = fileType === "application/pdf";
    const isVideo = fileType.startsWith("video/");
    const isImage = fileType.startsWith("image/");
    const materialType = (material?.type || "OTHER").toUpperCase();

    if (materialType === "PDF" && !isPdf) {
      toast.error("Please upload a PDF file");
      return;
    }
    if (materialType === "VIDEO" && !isVideo) {
      toast.error("Please upload a video file");
      return;
    }
    if (materialType === "NOTE" && !(isPdf || isImage)) {
      toast.error("Please upload a PDF or image file for notes");
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (notes.trim()) {
        formData.append("notes", notes.trim());
      }
      const res = await api.post(`/materials/mversions/add/${material.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Version uploaded");
      setVersions((prev) => [res.data, ...prev]);
      setNotes("");
      setFile(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload version");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (versionId) => {
    if (!window.confirm("Delete this version?")) return;
    setDeletingId(versionId);
    try {
      await api.delete(`/materials/mversions/delete/${versionId}`);
      setVersions((prev) => prev.filter((version) => version.id !== versionId));
      toast.success("Version deleted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const currentUserId = getUserId(currentUser);
  const canUpload = Boolean(currentUserId);

  if (!material) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Versions for {material.title}</h3>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            x
          </button>
        </div>
        <div className="modal-body">
          {canUpload ? (
            <form className="add-version" onSubmit={handleAddVersion}>
              <h4>Add new version</h4>
              <div className="file-input">
                <label htmlFor="version-file">Choose file</label>
                <input
                  id="version-file"
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </div>
              <textarea
                placeholder="Notes (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows="2"
              />
              <button type="submit" disabled={submitting}>
                {submitting ? "Uploading..." : "Upload"}
              </button>
            </form>
          ) : (
            <div className="add-version">
              <h4>Add new version</h4>
              <p>Sign in to upload a new version.</p>
            </div>
          )}

          <div className="versions-list">
            {loading && <div className="loading-spinner">Loading versions...</div>}
            {!loading && error && <div className="error-message">{error}</div>}
            {!loading && !error && versions.length === 0 && (
              <div className="error-message">No versions found.</div>
            )}
            {!loading && !error && versions.length > 0 && (
              <ul>
                {versions.map((version) => {
                  const uploaderId = getUserId(version?.uploadedBy);
                  const canDelete = uploaderId && currentUserId && uploaderId === currentUserId;
                  const fileLabel = version.originalFilename || "Open file";
                  const fileSize = formatBytes(version.fileSize);
                  return (
                    <li key={version.id}>
                      <div className="version-info">
                        <span className="version-number">Version {version.versionNumber}</span>
                        <span className="version-date">{formatDate(version.uploadedAt)}</span>
                        {fileSize && <span>{fileSize}</span>}
                      </div>
                      {version.notes && <div className="version-notes">{version.notes}</div>}
                      <div className="material-link">
                        <a href={toAbsolute(version.fileUrl)} target="_blank" rel="noreferrer">
                          {fileLabel}
                        </a>
                      </div>
                      {canDelete && (
                        <div className="item-actions">
                          <button
                            className="delete-btn"
                            onClick={() => handleDelete(version.id)}
                            disabled={deletingId === version.id}
                          >
                            {deletingId === version.id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}




