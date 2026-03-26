import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./css/Settings.css";

export default function SettingsPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    profileImageUrl: "",
    coverImageUrl: "",
  });

  const [nameForm, setNameForm] = useState({ name: "", lastName: "" });
  const [emailForm, setEmailForm] = useState({ newEmail: "", otp: "" });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [deleteForm, setDeleteForm] = useState({ currentPassword: "" });

  const [profileFile, setProfileFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);

  const [profilePreview, setProfilePreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);


  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/user/me", { withCredentials: true });
        const data = res.data;

        setUser({
          firstName: data.firstName || data.firstname || data.name || "",
          lastName: data.lastName || data.lastname || "",
          email: data.email || "",
          profileImageUrl: data.profileImageUrl || data.imageUrl || "",
          coverImageUrl: data.coverImageUrl || "",
        });

        setNameForm({
          name: data.firstName || data.firstname || data.name || "",
          lastName: data.lastName || data.lastname || "",
        });

        const base = api.defaults.baseURL || "";
        const toAbsolute = (url) =>
          url ? (url.startsWith("http") ? url : base + url) : null;

        setProfilePreview(toAbsolute(data.profileImageUrl || data.imageUrl));
        setCoverPreview(toAbsolute(data.coverImageUrl));
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };

    fetchUser();
  }, []);

 
  const handleProfileFile = (e) => {
    const file = e.target.files[0];
    setProfileFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfilePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleCoverFile = (e) => {
    const file = e.target.files[0];
    setCoverFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCoverPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };


  const validateName = () => {
    if (!nameForm.name.trim()) return toast.error("First name is required");
    if (!nameForm.lastName.trim()) return toast.error("Last name is required");
    return true;
  };

  const validateEmail = () => {
    if (!emailForm.newEmail) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(emailForm.newEmail))
      return toast.error("Invalid email format");
    return true;
  };

  const validatePassword = () => {
    if (!passwordForm.currentPassword)
      return toast.error("Current password required");
    if (passwordForm.newPassword.length < 6)
      return toast.error("Password must be at least 6 characters");
    if (passwordForm.newPassword !== passwordForm.confirmPassword)
      return toast.error("Passwords do not match");
    return true;
  };

  const validateDelete = () => {
    if (!deleteForm.currentPassword)
      return toast.error("Enter password to delete account");
    return true;
  };


  const handleResponse = (res, redirectLogin = false) => {
    toast.success(res.data?.message || "Success");
    if (redirectLogin) setTimeout(() => navigate("/login"), 1500);
  };

  const handleError = (err) => {
    toast.error(err.response?.data?.message || "Something went wrong");
  };


  const updateName = async () => {
    if (!validateName()) return;
    setLoading(true);
    try {
      const res = await api.put("/user/update-name", nameForm, {
        withCredentials: true,
      });
      handleResponse(res);
      setUser({ ...user, firstName: nameForm.name, lastName: nameForm.lastName });
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const requestEmailUpdate = async () => {
    if (!validateEmail()) return;
    setLoading(true);
    try {
      const res = await api.put(
        "/user/update-email",
        { newEmail: emailForm.newEmail },
        { withCredentials: true }
      );
      handleResponse(res);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const verifyNewEmail = async () => {
    if (!emailForm.otp) return toast.error("OTP required");
    setLoading(true);
    try {
      const res = await api.post("/user/verify-new-email", null, {
        params: { otp: emailForm.otp },
        withCredentials: true,
      });
      handleResponse(res, true);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async () => {
    if (!validatePassword()) return;
    setLoading(true);
    try {
      const res = await api.put("/user/update-password", passwordForm, {
        withCredentials: true,
      });
      handleResponse(res, true);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async () => {
    if (!validateDelete()) return;
    setLoading(true);
    try {
      const res = await api.delete("/user/delete", {
        data: deleteForm,
        withCredentials: true,
      });
      handleResponse(res, true);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const uploadProfileImage = async () => {
    if (!profileFile) return toast.error("Select a profile image");
    setUploading(true);
    const formData = new FormData();
    formData.append("file", profileFile);
    try {
      const res = await api.post("/user/upload-profile-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      toast.success("Profile image uploaded!");
      const newUrl = res.data.imageUrl || res.data;
      setUser({ ...user, profileImageUrl: newUrl });
      const base = api.defaults.baseURL || "";
      const toAbsolute = (url) => (url ? (url.startsWith("http") ? url : base + url) : null);
      setProfilePreview(toAbsolute(newUrl));
    } catch (err) {
      handleError(err);
    } finally {
      setUploading(false);
    }
  };

  const uploadCoverImage = async () => {
    if (!coverFile) return toast.error("Select a cover image");
    setUploading(true);
    const formData = new FormData();
    formData.append("file", coverFile);
    try {
      const res = await api.post("/user/upload-cover-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      toast.success("Cover image uploaded!");
      const newUrl = res.data.imageUrl || res.data;
      setUser({ ...user, coverImageUrl: newUrl });
      const base = api.defaults.baseURL || "";
      const toAbsolute = (url) => (url ? (url.startsWith("http") ? url : base + url) : null);
      setCoverPreview(toAbsolute(newUrl));
    } catch (err) {
      handleError(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="settings-page">
      <ToastContainer />
      <div className="settings-container">
        <div className="settings-header">
          <button className="back-button" onClick={() => navigate("/profile")}>
            ← Back to Profile
          </button>
          <h1>Account Settings</h1>
        </div>

        <div className="media-section">
          <div className="cover-area">
            {coverPreview ? (
              <img src={coverPreview} alt="Cover" className="cover-preview" />
            ) : (
              <div className="cover-placeholder">Cover image</div>
            )}
            <div className="cover-upload">
              <input
                type="file"
                accept="image/*"
                id="coverInput"
                onChange={handleCoverFile}
                style={{ display: "none" }}
              />
              <button onClick={() => document.getElementById("coverInput").click()}>
                Choose Cover
              </button>
              <button onClick={uploadCoverImage} disabled={uploading}>
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>

          <div className="profile-area">
            <div className="profile-picture">
              {profilePreview ? (
                <img src={profilePreview} alt="Profile" />
              ) : (
                <div className="profile-placeholder">
                  {user.firstName ? user.firstName[0].toUpperCase() : "U"}
                </div>
              )}
            </div>
            <div className="profile-upload">
              <input
                type="file"
                accept="image/*"
                id="profileInput"
                onChange={handleProfileFile}
                style={{ display: "none" }}
              />
              <button onClick={() => document.getElementById("profileInput").click()}>
                Choose Photo
              </button>
              <button onClick={uploadProfileImage} disabled={uploading}>
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
            <h2>{user.firstName} {user.lastName}</h2>
            <p>{user.email}</p>
          </div>
        </div>

      
        <div className="settings-grid">
          
          <div className="setting-card">
            <div className="card-icon">👤</div>
            <div className="card-body">
              <h3>Update Name</h3>
              <input
                placeholder="First Name"
                value={nameForm.name}
                onChange={(e) => setNameForm({ ...nameForm, name: e.target.value })}
              />
              <input
                placeholder="Last Name"
                value={nameForm.lastName}
                onChange={(e) => setNameForm({ ...nameForm, lastName: e.target.value })}
              />
              <button onClick={updateName} disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>

      
<div className="setting-card">
  <div className="card-icon">✉️</div>
  <div className="card-body">
    <h3>Update Email</h3>
    <input
      placeholder="New Email"
      value={emailForm.newEmail}
      onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
    />
    <button onClick={requestEmailUpdate} disabled={loading} className="request-otp-btn">
      {loading ? "Sending..." : "Request OTP"}
    </button>
    <input
      placeholder="OTP Code"
      value={emailForm.otp}
      onChange={(e) => setEmailForm({ ...emailForm, otp: e.target.value })}
    />
    <div className="button-group">
      <button onClick={verifyNewEmail} disabled={loading} className="verify-btn">
        {loading ? "Verifying..." : "Verify & Update"}
      </button>
   
    </div>
  </div>
</div>

       
          <div className="setting-card">
            <div className="card-icon">🔒</div>
            <div className="card-body">
              <h3>Change Password</h3>
              <div className="password-field">
                <input
                  type={showPassword.current ? "text" : "password"}
                  placeholder="Current Password"
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                  }
                />
                <button
                  type="button"
                  className="toggle"
                  onClick={() =>
                    setShowPassword({ ...showPassword, current: !showPassword.current })
                  }
                >
                  {showPassword.current ? "Hide" : "Show"}
                </button>
              </div>
              <div className="password-field">
                <input
                  type={showPassword.new ? "text" : "password"}
                  placeholder="New Password (min. 6)"
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                />
                <button
                  type="button"
                  className="toggle"
                  onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                >
                  {showPassword.new ? "Hide" : "Show"}
                </button>
              </div>
              <div className="password-field">
                <input
                  type={showPassword.confirm ? "text" : "password"}
                  placeholder="Confirm New Password"
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                  }
                />
                <button
                  type="button"
                  className="toggle"
                  onClick={() =>
                    setShowPassword({ ...showPassword, confirm: !showPassword.confirm })
                  }
                >
                  {showPassword.confirm ? "Hide" : "Show"}
                </button>
              </div>
              <button onClick={updatePassword} disabled={loading}>
                {loading ? "Updating..." : "Update Password"}
              </button>
            </div>
          </div>

     
          <div className="setting-card danger">
            <div className="card-icon">⚠️</div>
            <div className="card-body">
              <h3>Delete Account</h3>
              <p className="warning">⚠️ This action is irreversible. All data will be removed.</p>
              <input
                type="password"
                placeholder="Confirm Password"
                onChange={(e) => setDeleteForm({ currentPassword: e.target.value })}
              />
              <button onClick={deleteAccount} disabled={loading}>
                {loading ? "Deleting..." : "Permanently Delete Account"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}