
import { useState, useEffect } from "react";
import { User, Mail, Shield, Save, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Profile() {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  useEffect(() => {
    setName(user?.name || "");
    setEmail(user?.email || "");
  }, [user]);

  const handleSave = (e) => {
    e.preventDefault();

    updateUser({ name: name.trim(), email: email.trim() });

    alert("Profile updated successfully!");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initial = name.trim().charAt(0).toUpperCase() || "U";

  return (
    <div className="dashboard-page">
      <div className="page-heading">
        <div>
          <h1>My Profile</h1>
          <p>Manage your personal account details.</p>
        </div>
      </div>

      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-avatar">
            {initial}
          </div>

          <h2>{name || "Your Name"}</h2>
          <p>{email || "your@email.com"}</p>
          <span className="profile-status">Personal Account</span>
        </div>

        <div className="profile-form-card">
          <h2>Personal Information</h2>
          <p>Update your account information below.</p>

          <form onSubmit={handleSave}>
            <label>Full Name</label>
            <div className="profile-input">
              <User size={18} />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <label>Email Address</label>
            <div className="profile-input">
              <Mail size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="profile-security">
              <Shield size={20} />
              <div>
                <strong>Account Security</strong>
                <p>Your account details are protected.</p>
              </div>
            </div>

            <button type="submit" className="profile-save-btn">
              <Save size={18} />
              Save Changes
            </button>
          </form>

          <button
            className="profile-logout-btn"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
