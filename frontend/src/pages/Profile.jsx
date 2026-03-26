import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./css/Profile.css";

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/user/me", { withCredentials: true });
        setProfile(res.data);
      } catch (err) {
        if (err.response?.status === 401) {
          navigate("/login", { state: { message: "Please login first" } });
        } else {
          setError(err.response?.data?.message || "Failed to load profile");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  if (loading) return <div className="loading">Loading profile...</div>;
  if (error) return <div className="error">{error}</div>;

  const {
    firstName = "",
    lastName = "",
    email = "",
    phoneNumber = "",
    tempEmail = "",
    role = "",
    profileImageUrl = "",
    coverImageUrl = "",
  } = profile || {};


  const first = firstName || profile?.firstname || profile?.name || "";
  const last = lastName || "";
  const fullName = `${first} ${last}`.trim() || "User";

  const backendBaseUrl = api.defaults.baseURL || "";
  const toAbsolute = (url) =>
    url ? (url.startsWith("http") ? url : backendBaseUrl + url) : null;

  const profileImageFull = toAbsolute(profileImageUrl);
  const coverImageFull = toAbsolute(coverImageUrl);

  const avatarFallback = first ? first.charAt(0).toUpperCase() : "U";

  const getBackPath = () => {
    switch (role) {
      case "ROLE_ADMIN":
        return "/adminhome";
      case "ROLE_LIBRARIAN":
        return "/librarianhome";
      case "ROLE_USER":
      default:
        return "/home";
    }
  };

  return (
    <div className="profile-page">
      <div className="cover-container">
        {coverImageFull ? (
          <img src={coverImageFull} alt="Cover" className="cover-image" />
        ) : (
          <div className="cover-placeholder" />
        )}
        <button
          className="back-button-top-left"
          onClick={() => navigate(getBackPath())}
          aria-label="Back to home"
        >
          ←
        </button>
      </div>

      <div className="profile-picture-wrapper">
        <div className="profile-picture-container">
          {profileImageFull ? (
            <img src={profileImageFull} alt="Profile" className="profile-picture" />
          ) : (
            <div className="profile-picture-fallback">{avatarFallback}</div>
          )}
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-name">
          <h1>{fullName}</h1>
          {role && <span className="role-badge">{role.replace("ROLE_", "")}</span>}
        </div>

        <div className="contact-grid">
          <div className="contact-item">
            <div className="contact-icon">✉️</div>
            <div>
              <div className="contact-label">Email</div>
              <div className="contact-value">{email}</div>
            </div>
          </div>
          <div className="contact-item">
            <div className="contact-icon">📱</div>
            <div>
              <div className="contact-label">Phone</div>
              <div className="contact-value">{phoneNumber || "Not provided"}</div>
            </div>
          </div>
          {tempEmail && (
            <div className="contact-item">
              <div className="contact-icon">🔄</div>
              <div>
                <div className="contact-label">Backup Email</div>
                <div className="contact-value">{tempEmail}</div>
              </div>
            </div>
          )}
        </div>

        <div className="profile-actions">
          <button className="edit-button" onClick={() => navigate("/settings")}>
            Edit Profile
          </button>
          <button className="logout-button" onClick={() => navigate("/login")}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}