import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../api/axios";
import "./SuggestItem.css";
import Navbar from "../components/Navbar";

export default function SuggestItem() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    const value = searchTerm.trim();
    if (!value) {
      toast.error("Please enter an item name");
      return;
    }
    if (value.length < 2) {
      toast.error("Search term must be at least 2 characters");
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const res = await api.get("/lostfound/suggest", {
        params: { itemName: searchTerm },
      });
      setResults(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch suggestions");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const backendBaseUrl = api.defaults.baseURL || "";
  const toAbsolute = (url) =>
    url ? (url.startsWith("http") ? url : backendBaseUrl + url) : null;

  return (
    <div className="suggest-page">
      <ToastContainer position="top-right" autoClose={3000} />
      <Navbar />
      <div className="container">
        <div className="page-header">
          <h1>Find Similar Items</h1>
          <p>Enter an item name to find matching lost & found entries</p>
        </div>

        <form onSubmit={handleSearch} className="search-form">
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="e.g., 'laptop', 'wallet', 'keys'"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" disabled={loading}>
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </form>

        {searched && (
          <div className="results-section">
            {loading ? (
              <div className="loading-spinner">Loading suggestions...</div>
            ) : results.length === 0 ? (
              <div className="no-results">
                <p>No matching items found. Try a different name.</p>
              </div>
            ) : (
              <div className="results-grid">
                {results.map((item) => (
                  <div key={item.id} className="result-card">
                    <div className="result-image">
                      {item.imageUrl ? (
                        <img src={toAbsolute(item.imageUrl)} alt={item.itemName} />
                      ) : (
                        <div className="no-image">📷</div>
                      )}
                    </div>
                    <div className="result-info">
                      <h3>{item.itemName}</h3>
                      <p className="location">📍 {item.foundPlace}</p>
                      <p className="publisher">👤 {item.publisherName}</p>
                      <p className="contact">📞 {item.contactPhone || "Not provided"}</p>
                      <p className="semester">📅 {item.year} – {item.semester}</p>
                      <p className="description">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}