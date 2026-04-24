import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import api from "../api/axios";
import Navbar from "../components/Navbar";
import "./MyFoundItems.css";

const MyLostItems = () => {
  const [lostItems, setLostItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const baseUrl = api.defaults.baseURL || "";

  useEffect(() => {
    loadLostItems();
  }, []);

  const loadLostItems = async () => {
    try {
      const { data } = await api.get("/lostfound/lost/me");
      setLostItems(data);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Failed to load items");
      toast.error("Could not load your lost items");
    } finally {
      setIsLoading(false);
    }
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    return imageUrl.startsWith("http") ? imageUrl : `${baseUrl}${imageUrl}`;
  };

  const goToDetails = (itemId) => {
    navigate(`/lost-item/${itemId}`);
  };

  const goToAddLostItem = () => {
    navigate("/add-lost");
  };

  const renderContent = () => {
    if (isLoading) {
      return <div className="loading-spinner">Loading...</div>;
    }

    if (errorMessage) {
      return <div className="error-message">{errorMessage}</div>;
    }

    if (lostItems.length === 0) {
      return (
          <div className="no-items">
            <p>You haven't reported any lost items yet.</p>
            <button className="add-btn" onClick={goToAddLostItem}>
              Report a Lost Item
            </button>
          </div>
      );
    }

    return (
        <div className="items-grid">
          {lostItems.map((item) => (
              <div key={item.id} className="item-card">
                <div className="item-image">
                  {item.imageUrl ? (
                      <img src={getImageUrl(item.imageUrl)} alt={item.itemName} />
                  ) : (
                      <div className="no-image">📷</div>
                  )}
                </div>

                <div className="item-info">
                  <h3>{item.itemName}</h3>
                  <p className="location">📍 {item.lostPlace}</p>
                  <p className="publisher">👤 {item.contactName}</p>

                  <button
                      className="view-btn"
                      onClick={() => goToDetails(item.id)}
                  >
                    View Details
                  </button>
                </div>
              </div>
          ))}
        </div>
    );
  };

  return (
      <div className="my-lost-page">
        <ToastContainer position="top-right" autoClose={3000} />
        <Navbar />

        <div className="container">
          <div className="page-header">
            <h1>My Lost Items</h1>
            <p>Items you have reported as lost</p>
          </div>

          {renderContent()}
        </div>
      </div>
  );
};

export default MyLostItems;
