import { useState } from "react";
import { Trash2, X } from "lucide-react";
import "../Dashboard.css";
import Profile from "../screens/Profile";

const stats = [
  { title: "Total Queries", value: "12,430" },
  { title: "Active Users", value: "2,145" },
  { title: "AI Accuracy", value: "96%" },
];

const documents = [
  "Document 1",
  "Document 2",
  "Document 3",
  "Document 4",
  "Document 5",
  "Document 6",
  "Document 7",
];

type Page = "dashboard" | "profile";

export default function Dashboard() {
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState<Page>("dashboard");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("New admin added (mock)");
    setShowModal(false);
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>Admin Dashboard</h2>
        <nav>
          <button onClick={() => setShowModal(true)}>Add Admin</button>
          <button onClick={() => setPage("profile")}>Profile</button>
          <button>Add Document</button>
          <button>FAQ</button>
        </nav>
      </aside>

      {/* Main */}
      <main className="dashboard-main">
        {page === "dashboard" && (
          <>
            {/* Stats */}
            <div className="stats-grid">
              {stats.map((stat, i) => (
                <div key={i} className="stat-card">
                  <h4>{stat.title}</h4>
                  <p>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Documents */}
            <div className="documents-list">
              {documents.map((doc, i) => (
                <div key={i} className="document-row">
                  <span>{doc}</span>
                  <Trash2 className="delete-icon" />
                </div>
              ))}
            </div>
          </>
        )}

        {page === "profile" && <Profile />}
      </main>

      {/* ADD ADMIN MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <button className="close-btn" onClick={() => setShowModal(false)}>
              <X />
            </button>

            <h2>Add New Admin</h2>

            <form onSubmit={handleSubmit}>
              <input type="text" placeholder="Name" required />
              <input type="text" placeholder="Surname" required />
              <input type="email" placeholder="Email" required />
              <input type="password" placeholder="Password" required />

              <button type="submit" className="submit-btn">
                Add
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
