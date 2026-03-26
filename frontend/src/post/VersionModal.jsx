import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../api/axios";

export default function VersionModal({ material, onClose, readOnly = false }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);

  const backendBaseUrl = api.defaults.baseURL || "";
  const toAbsolute = (url) =>
    url ? (url.startsWith("http") ? url : backendBaseUrl + url) : null;

  useEffect(() => {
    fetchVersions();
  }, []);

  const fetchVersions = async () => {
    try {
      const res = await api.get(`/materials/mversions/list/${material.id}`);
      setVersions(res.data);
    } catch (err) {
      toast.error("Failed to load versions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Versions – {material.title}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {!readOnly && (
            <div className="add-version">
              <h4>Upload new version</h4>
              <div className="file-input">
                <label htmlFor="version-file">📎 Choose file</label>
                <input
                  type="file"
                  id="version-file"
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </div>
              <textarea
                placeholder="Version notes (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows="2"
              />
              <button onClick={handleUploadVersion} disabled={uploading}>
                {uploading ? "Uploading..." : "Add Version"}
              </button>
            </div>
          )}

          <div className="versions-list">
            <h4>Previous versions</h4>
            {loading ? (
              <p>Loading...</p>
            ) : versions.length === 0 ? (
              <p>No previous versions.</p>
            ) : (
              <ul>
                {versions.map(v => (
                  <li key={v.id}>
                    <div className="version-info">
                      <span className="version-number">v{v.versionNumber}</span>
                      <span className="version-date">{new Date(v.uploadedAt).toLocaleString()}</span>
                    </div>
                    {v.notes && <p className="version-notes">{v.notes}</p>}
                    <a href={toAbsolute(v.fileUrl)} target="_blank" rel="noopener noreferrer">
                      📄 Download
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}