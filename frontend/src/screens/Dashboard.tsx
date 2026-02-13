import { useState, useEffect, type ChangeEvent } from "react";
import { Trash2, X } from "lucide-react";
import "../Dashboard.css";
import Profile from "../screens/Profile";
import { useDispatch, useSelector } from "react-redux";
import { type AppDispatch, type RootState } from "../redux/store";
import { addAdmin } from "../redux/adminSlice";
import {
  fetchDocuments,
  uploadDocument,
  deleteDocument,
  type Document,
} from "../redux/documentSlice";
import { useNavigate } from "react-router-dom"; // ✅ add

const stats = [
  { title: "Daily Questions this week", value: "96%" },
  { title: "Orphan topics", value: "2,145" },
  { title: "Out of scope", value: "12,430" },
  { title: "No result found", value: "2,145" },
];

type Page = "dashboard" | "profile";

export default function Dashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate(); // ✅ add

  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [page, setPage] = useState<Page>("dashboard");

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const documents = useSelector(
    (state: RootState) => state.documents.documents,
  );
  const loading = useSelector((state: RootState) => state.documents.loading);
  const error = useSelector((state: RootState) => state.documents.error);

  useEffect(() => {
    dispatch(fetchDocuments());
  }, [dispatch]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(addAdmin(form));
    alert("Admin successfully added!");
    setShowAdminModal(false);
    setForm({ fullName: "", email: "", password: "" });
  };

  const handleDocUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return alert("Please select a file first.");
    setUploading(true);

    try {
      await dispatch(uploadDocument(selectedFile)).unwrap();
      setShowDocModal(false);
      setSelectedFile(null);
      alert("Document uploaded successfully!");
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId: string, storagePath: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    setDeletingId(docId);

    try {
      await dispatch(deleteDocument({ id: docId, storagePath })).unwrap();
      alert("Document deleted successfully!");
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete document");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>Admin Dashboard</h2>
        <nav>
          <button onClick={() => setPage("profile")}>Profile</button>
          <button onClick={() => setShowDocModal(true)}>Add Document</button>

          {/* ✅ Admin List goes to AdminsPage route */}
          <button onClick={() => navigate("/admins-list")}>Admin List</button>
          <button onClick={() => navigate("/models")}>Manage Models</button>
          <button>FAQ</button>
        </nav>
      </aside>

      {/* Main */}
      <main className="dashboard-main">
        {page === "dashboard" && (
          <>
            <div className="stats-grid">
              {stats.map((stat, i) => (
                <div key={i} className="stat-card">
                  <h4>{stat.title}</h4>
                  <p>{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="documents-list">
              {loading && <p>Loading documents...</p>}
              {error && <p style={{ color: "red" }}>{error}</p>}
              {!loading && documents.length === 0 && <p>No documents found.</p>}
              {documents.map((doc: Document) => (
                <div key={doc.id} className="document-row">
                  <a href={doc.url} target="_blank" rel="noopener noreferrer">
                    {doc.name}
                  </a>
                  <Trash2
                    className="delete-icon"
                    onClick={() => handleDelete(doc.id, doc.storagePath)}
                    style={{ opacity: deletingId === doc.id ? 0.5 : 1 }}
                  />
                </div>
              ))}
            </div>
          </>
        )}

        {page === "profile" && <Profile />}
      </main>

      {/* MODALS unchanged... */}
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
              <button type="submit" className="submit-btn">
                Add
              </button>
            </form>
          </div>
        </div>
      )}

      {showDocModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <button
              className="close-btn"
              onClick={() => setShowDocModal(false)}
            >
              <X />
            </button>
            <h2>Add Document</h2>
            <form onSubmit={handleDocUpload}>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.txt"
                required
              />
              <button type="submit" className="submit-btn" disabled={uploading}>
                {uploading ? "Uploading..." : "Save"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
