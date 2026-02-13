// ModelScreen.tsx
import React, { useEffect, useMemo, useState } from "react";
import "../css/modelScreen.css";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../redux/store";
import {
  fetchModels,
  createModel,
  updateModel,
  deleteModel,
  toggleModelHidden,
  selectModels,
  selectModelsLoading,
  selectModelsError,
  type ModelCategory,
} from "../redux/modelSlice";

/** ✅ Match your DB table */
type ModelRow = {
  id?: string;
  name: string;
  apiKey: string;
  fullName: string;
  systemPrompt: string;
  category: ModelCategory;
  createdAt?: string;
  updatedAt?: string;

  // optional (only if you have it in DB)
  isHidden?: boolean;
};

/** UI-only (not saved to DB) */
type ModelRowUi = ModelRow & { isKeyVisible?: boolean };

type ModelFormState = {
  name: string;
  fullName: string;
  apiKey: string;
  category: ModelCategory;
  systemPrompt: string;
  createdAt?: string;
  updatedAt?: string;
};

const emptyForm: ModelFormState = {
  name: "",
  fullName: "",
  apiKey: "",
  category: "Navigation & Support",
  systemPrompt: "",
  createdAt: "",
  updatedAt: "",
};

function formatDate(dIso?: string) {
  if (!dIso) return "—";
  const d = new Date(dIso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString();
}

export default function ModelScreen() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const modelsFromStore = useSelector(selectModels) as unknown as ModelRow[];
  const loading = useSelector(selectModelsLoading);
  const error = useSelector(selectModelsError);

  const [keyVisibility, setKeyVisibility] = useState<Record<string, boolean>>(
    {},
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ModelFormState>(emptyForm);

  useEffect(() => {
    dispatch(fetchModels());
  }, [dispatch]);

  const models: ModelRowUi[] = useMemo(() => {
    return (modelsFromStore ?? []).map((m) => ({
      ...m,
      isKeyVisible: m.id ? Boolean(keyVisibility[m.id]) : false,
    }));
  }, [modelsFromStore, keyVisibility]);

  const modalTitle = useMemo(
    () => (mode === "add" ? "Add Model" : "Edit Model"),
    [mode],
  );

  const openAdd = () => {
    setMode("add");
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (m: ModelRowUi) => {
    setMode("edit");
    setEditingId(m.id ?? null);
    setForm({
      name: m.name ?? "",
      fullName: m.fullName ?? "",
      apiKey: m.apiKey ?? "",
      category: m.category ?? "Navigation & Support",
      systemPrompt: m.systemPrompt ?? "",
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) return alert("Name is required.");
    if (!form.fullName.trim()) return alert("Full name is required.");
    if (!form.apiKey.trim()) return alert("API key is required.");
    if (!form.systemPrompt.trim()) return alert("System prompt is required.");

    try {
      if (mode === "add") {
        await dispatch(
          createModel({
            name: form.name.trim(),
            fullName: form.fullName.trim(),
            apiKey: form.apiKey.trim(),
            category: form.category,
            systemPrompt: form.systemPrompt.trim(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          } as any),
        ).unwrap();

        closeModal();
        return;
      }

      if (!editingId) return;

      await dispatch(
        updateModel({
          id: editingId,
          changes: {
            name: form.name.trim(),
            fullName: form.fullName.trim(),
            apiKey: form.apiKey.trim(),
            category: form.category,
            systemPrompt: form.systemPrompt.trim(),
            createdAt: form.createdAt,
            updatedAt: new Date().toISOString(),
          },
        } as any),
      ).unwrap();

      closeModal();
    } catch (err: any) {
      alert(err?.message ?? "Something went wrong.");
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    const ok = window.confirm("Delete this model? This cannot be undone.");
    if (!ok) return;

    try {
      await dispatch(deleteModel(id)).unwrap();
    } catch (err: any) {
      alert(err?.message ?? "Failed to delete model.");
    }
  };

  const handleToggleHide = async (m: ModelRowUi) => {
    if (!m.id) return;

    try {
      await dispatch(
        toggleModelHidden({
          id: m.id,
          isHidden: !Boolean(m.isHidden),
        }),
      ).unwrap();
    } catch (err: any) {
      alert(
        err?.message ??
          "Failed to toggle visibility. Ensure PATCH route exists and DB has isHidden column.",
      );
    }
  };

  const toggleKeyVisibility = (id?: string) => {
    if (!id) return;
    setKeyVisibility((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const maskKey = (key: string) => {
    if (!key) return "";
    if (key.length <= 8) return "••••••••";
    return `${key.slice(0, 3)}••••••••••••${key.slice(-4)}`;
  };

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <nav>
          <div className="sidebar__title">Admin Dashboard</div>
          <button onClick={() => navigate("/dashboard")}>Dashboard</button>
          <button onClick={() => navigate("/profile")}>Profile</button>
          <button onClick={() => navigate("/admins-list")}>Admin List</button>
          <button onClick={() => navigate("/faqs")}>FAQ</button>
        </nav>
      </aside>

      <main className="content">
        <div className="page-top">
          <h1 className="page-title">Models</h1>

          <button className="btn btn--add" onClick={openAdd}>
            Add Model
          </button>
        </div>

        <section className="table-card">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Model Full Name</th>
                  <th>API Key</th>
                  <th>Category</th>
                  <th>System Prompt</th>
                  <th>Date Added</th>
                  <th>Last Edited</th>
                  <th className="th-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td className="empty" colSpan={8}>
                      Loading models...
                    </td>
                  </tr>
                ) : null}

                {!loading && error ? (
                  <tr>
                    <td className="empty" colSpan={8}>
                      {error}
                    </td>
                  </tr>
                ) : null}

                {!loading && !error
                  ? models.map((m) => (
                      <tr key={m.id} className={m.isHidden ? "row-hidden" : ""}>
                        <td className="td-strong">
                          {m.name}
                          {m.isHidden ? (
                            <span className="pill">Hidden</span>
                          ) : null}
                        </td>

                        <td className="td-muted">{m.fullName || "—"}</td>

                        <td>
                          <div className="key-cell">
                            <span className="mono">
                              {m.isKeyVisible ? m.apiKey : maskKey(m.apiKey)}
                            </span>

                            <button
                              className="icon-btn"
                              title={
                                m.isKeyVisible ? "Hide API key" : "Show API key"
                              }
                              onClick={() => toggleKeyVisibility(m.id)}
                              type="button"
                            >
                              {m.isKeyVisible ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                          </div>
                        </td>

                        <td className="td-muted">{m.category || "—"}</td>

                        <td className="td-muted clamp">
                          {m.systemPrompt || "—"}
                        </td>

                        <td>{formatDate(m.createdAt)}</td>
                        <td>{formatDate(m.updatedAt)}</td>

                        <td className="td-actions">
                          <button
                            className="icon-btn"
                            title="Edit"
                            onClick={() => openEdit(m)}
                            type="button"
                            disabled={!m.id}
                          >
                            <EditIcon />
                          </button>

                          <button
                            className="icon-btn"
                            title={m.isHidden ? "Unhide model" : "Hide model"}
                            onClick={() => handleToggleHide(m)}
                            type="button"
                            disabled={!m.id}
                          >
                            {m.isHidden ? <EyeIcon /> : <EyeOffIcon />}
                          </button>

                          <button
                            className="icon-btn icon-btn--danger"
                            title="Delete"
                            onClick={() => handleDelete(m.id)}
                            type="button"
                            disabled={!m.id}
                          >
                            <TrashIcon />
                          </button>
                        </td>
                      </tr>
                    ))
                  : null}

                {!loading && !error && models.length === 0 ? (
                  <tr>
                    <td className="empty" colSpan={8}>
                      No models yet. Click <b>Add Model</b>.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        {/* MODAL */}
        {modalOpen ? (
          <div className="modal-backdrop" onMouseDown={closeModal}>
            <div
              className="modal"
              onMouseDown={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              <div className="modal__top">
                <h2 className="modal__title">{modalTitle}</h2>
                <button
                  className="icon-btn"
                  onClick={closeModal}
                  type="button"
                  title="Close"
                >
                  ✕
                </button>
              </div>

              <form className="form" onSubmit={handleSave}>
                <div className="form-grid">
                  <div className="field">
                    <label>Name *</label>
                    <input
                      className="input"
                      value={form.name}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, name: e.target.value }))
                      }
                      placeholder="e.g. Trinity"
                    />
                  </div>

                  <div className="field">
                    <label>Model Name *</label>
                    <input
                      className="input"
                      value={form.fullName}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, fullName: e.target.value }))
                      }
                      placeholder="e.g. arcee-ai/trinity-mini:free"
                    />
                  </div>

                  <div className="field">
                    <label>API Key *</label>
                    <input
                      className="input"
                      value={form.apiKey}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, apiKey: e.target.value }))
                      }
                      placeholder="sk-..."
                    />
                  </div>

                  <div className="field field--full">
                    <label>Category *</label>
                    <select
                      className="input"
                      value={form.category}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          category: e.target.value as ModelCategory,
                        }))
                      }
                    >
                      <option value="Policy & Compliance">
                        Policy & Compliance
                      </option>
                      <option value="Technical  & Logic">
                        Technical & Logic
                      </option>
                      <option value="Navigation & Support">
                        Navigation & Support
                      </option>
                    </select>
                  </div>

                  <div className="field field--full">
                    <label>System Prompt *</label>
                    <textarea
                      className="textarea"
                      value={form.systemPrompt}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          systemPrompt: e.target.value,
                        }))
                      }
                      placeholder="You are..."
                      rows={5}
                    />
                  </div>
                </div>

                <div className="modal__actions">
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn--primary">
                    {mode === "add" ? "Add Model" : "Save Changes"}
                  </button>
                </div>

                <p className="hint">
                  * Date Added and Last Edited are set automatically by the
                  system.
                </p>
              </form>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}

/* ---------- SIMPLE INLINE SVG ICONS ---------- */

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 5c7 0 10 7 10 7s-3 7-10 7S2 12 2 12s3-7 10-7Zm0 2C7.5 7 4.9 10.7 4.1 12c.8 1.3 3.4 5 7.9 5s7.1-3.7 7.9-5c-.8-1.3-3.4-5-7.9-5Zm0 2.5A2.5 2.5 0 1 1 9.5 12A2.5 2.5 0 0 1 12 9.5Z"
      />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M2.1 3.5 3.5 2.1l18.4 18.4-1.4 1.4-3.1-3.1A10.9 10.9 0 0 1 12 19C5 19 2 12 2 12a18.7 18.7 0 0 1 4-5.3Zm8.2 8.2 3.9 3.9a2.5 2.5 0 0 1-3.9-3.9Zm1.7-6.6c7 0 10 6.9 10 6.9a18.7 18.7 0 0 1-3.6 5.1l-2.3-2.3a4.5 4.5 0 0 0-6-6L7.7 6.5A11.8 11.8 0 0 1 12 5.1Z"
      />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M3 17.3V21h3.7l10.9-10.9-3.7-3.7L3 17.3Zm17.7-10.6a1 1 0 0 0 0-1.4l-2-2a1 1 0 0 0-1.4 0l-1.6 1.6 3.7 3.7 1.3-1.9Z"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M9 3h6l1 2h4v2H4V5h4l1-2Zm1 6h2v10h-2V9Zm4 0h2v10h-2V9ZM6 9h2v10H6V9Z"
      />
    </svg>
  );
}
