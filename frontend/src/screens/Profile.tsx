import { useEffect, useState } from "react";
import { X } from "lucide-react";
import "../Dashboard.css";

export default function Profile() {
  const storedAdmin = JSON.parse(localStorage.getItem("admin") || "{}");

  const [profile, setProfile] = useState({
    id: "",
    fullName: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!storedAdmin?.id) return;

    fetch(`https://chatbot-w3ue.onrender.com/api/admins/${storedAdmin.id}`)
      .then((res) => res.json())
      .then((data) => {
        setProfile({ ...data, password: "" });
        setLoading(false);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: any = {
      fullName: profile.fullName,
      email: profile.email,
    };

    if (profile.password) payload.password = profile.password;

    const res = await fetch(`https://chatbot-w3ue.onrender.com/api/admins/${profile.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      alert("Update failed");
      return;
    }

    alert("Profile updated successfully");
    setShowModal(false);
  };

  if (loading) return <p style={{ color: "white" }}>Loading profile...</p>;

  return (
    <div className="profile-container">
      <div className="profile-card">
        {/* BACK BUTTON */}
        <button
          className="close"
          onClick={() => (window.location.href = "/dashboard")}
        >
          <X size={20} />
        </button>

        <h2>My Profile</h2>

        {/* VIEW MODE */}
        <div className="profile-view">
          <p>
            <strong>Name:</strong> {profile.fullName}
          </p>
          <p>
            <strong>Email:</strong> {profile.email}
          </p>
        </div>

        <div className="profile-actions">
          <button className="cancel-btn" onClick={() => setShowModal(true)}>
            Edit Profile
          </button>
          <button
            className="cancel-btn"
            onClick={() => {
              localStorage.removeItem("admin");
              window.location.href = "/";
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* EDIT MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2>Edit Profile</h2>

            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={profile.fullName}
                onChange={handleChange}
                required
              />

              <input
                type="email"
                name="email"
                placeholder="Email"
                value={profile.email}
                onChange={handleChange}
                required
              />

              <input
                type="password"
                name="password"
                placeholder="New Password"
                value={profile.password}
                onChange={handleChange}
              />

              <div className="modal-actions">
                <button type="submit" className="cancel-btn">
                  Save
                </button>

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
