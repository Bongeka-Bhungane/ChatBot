import { useEffect, useState, type ChangeEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../redux/store";
import {
  fetchAdmins,
  deleteAdmin,
  addAdmin,
  type Admin,
} from "../redux/adminSlice";
import { FiTrash2 } from "react-icons/fi";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../css/adminList.css";

type AdminForm = {
  fullName: string;
  email: string;
  password: string;
};

export default function AdminsList() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { admins, loading, error } = useSelector(
    (state: RootState) => state.admins,
  );

  // ✅ modal state
  const [showAdminModal, setShowAdminModal] = useState(false);

  // ✅ form state
  const [form, setForm] = useState<AdminForm>({
    fullName: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    dispatch(fetchAdmins());
  }, [dispatch]);

  const handleDelete = async (admin: Admin) => {
    if (!admin.id) {
      alert("Cannot delete: Admin id is missing.");
      return;
    }

    const ok = window.confirm(`Delete admin "${admin.fullName}"?`);
    if (!ok) return;

    try {
      await dispatch(deleteAdmin(admin.id)).unwrap();
      // optional refresh if your backend returns different data
      dispatch(fetchAdmins());
    } catch (e) {
      console.error(e);
      alert("Failed to delete admin");
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await dispatch(addAdmin(form)).unwrap();
      alert("Admin successfully added!");
      setShowAdminModal(false);
      setForm({ fullName: "", email: "", password: "" });
      dispatch(fetchAdmins());
    } catch (e) {
      console.error(e);
      alert("Failed to add admin");
    }
  };

  return (
    <div className="admin-layout">
      {/* ✅ Sidebar stays visible */}
      <aside className="sidebar">
        <h2>Admin Dashboard</h2>
        <nav>
          {/* If Profile is a route, navigate to it */}
          <button onClick={() => navigate("/dashboard")}>Dashboard</button>

          {/* if add document lives on dashboard, navigate there */}
          <button onClick={() => navigate("/profile")}>Profile</button>

          <button onClick={() => navigate("/models")}>Manage Models</button>
          <button onClick={() => navigate("/faqs")}>FAQ</button>
        </nav>
      </aside>

      {/* ✅ Main content */}
      <main className="admins-page">
        <div className="admins-header">
          <div>
            <h2>Admins</h2>
          </div>

          {/* ✅ Add Admin button on this page too */}
          <button
            className="admins-add-btn"
            onClick={() => setShowAdminModal(true)}
          >
            Add Admin
          </button>
        </div>

        {error && <div className="admins-error">{error}</div>}

        <div className="admins-card">
          <div className="admins-table-head">
            <span>Full Name</span>
            <span>Email</span>
            <span>Created</span>
            <span className="admins-actions-col">Actions</span>
          </div>

          {loading ? (
            <div className="admins-loading">Loading admins…</div>
          ) : admins.length === 0 ? (
            <div className="admins-empty">No admins found.</div>
          ) : (
            <div className="admins-table-body">
              {admins.map((admin) => (
                <div key={admin.id ?? admin.email} className="admins-row">
                  <span className="admins-name">{admin.fullName}</span>
                  <span className="admins-email">{admin.email}</span>
                  <span className="admins-date">
                    {admin.createdAt
                      ? new Date(admin.createdAt).toLocaleDateString()
                      : "—"}
                  </span>

                  <span className="admins-actions">
                    <button
                      className="admins-delete-btn"
                      onClick={() => handleDelete(admin)}
                      title="Delete admin"
                      aria-label={`Delete admin ${admin.fullName}`}
                      disabled={loading}
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ✅ ADD ADMIN MODAL */}
        {showAdminModal && (
          <div className="modal-overlay">
            <div className="modal-card">
              <button
                className="close-btn"
                onClick={() => setShowAdminModal(false)}
              >
                <X />
              </button>

              <h2>Add New Admin</h2>

              <form onSubmit={handleAdminSubmit}>
                <input
                  type="text"
                  placeholder="Full Name"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                />

                <input
                  type="email"
                  placeholder="Email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />

                <input
                  type="password"
                  placeholder="Password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />

                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? "Saving..." : "Add"}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
