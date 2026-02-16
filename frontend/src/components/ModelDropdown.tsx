// src/components/ModelDropdown.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import "../dropdown.css";
import { FaCheck } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../redux/store";
import {
  fetchModels,
  selectModels,
  selectModelsLoading,
  type Model,
} from "../redux/modelSlice";

type ModelDropdownProps = {
  model: string | null; // selected model id
  setModel: (modelId: string) => void;
  onClose?: () => void;
};

export default function ModelDropdown({ model, setModel }: ModelDropdownProps) {
  const dispatch = useDispatch<AppDispatch>();
  const models = useSelector(selectModels) as Model[];
  const loading = useSelector(selectModelsLoading);

  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    dispatch(fetchModels());
  }, [dispatch]);

  const current = useMemo(() => {
    return models.find((m) => m.id === model) || null;
  }, [models, model]);

  const handleSelect = (id?: string) => {
    if (!id) return;
    setModel(id);
    setOpen(false);
  };

  // Close on outside click
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // Close on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="model-dd-wrap" ref={wrapRef}>
      {/* Trigger pill (Gemini-style) */}
      <button
        type="button"
        className="model-dd-trigger"
        onClick={() => setOpen((s) => !s)}
        aria-haspopup="menu"
        aria-expanded={open}
        title="Choose a model"
      >
        <span className="model-dd-trigger-title">
          {current ? current.name : "Select Model"}
        </span>

        <span className={`model-dd-chevron ${open ? "open" : ""}`} aria-hidden>
          ▾
        </span>
      </button>

      {/* Popover */}
      {open && (
        <div className="model-dd-popover" role="menu">
          <div className="model-dd-list">
            {loading ? (
              <button
                type="button"
                className="model-dd-item"
                role="menuitem"
                disabled
              >
                <div className="model-dd-item-left">
                  <div className="model-dd-item-top">
                    <span className="model-dd-item-name">Loading...</span>
                  </div>
                  <div className="model-dd-item-sub">Please wait</div>
                </div>
              </button>
            ) : (
              models.map((m) => {
                const active = m.id === model;

                return (
                  <button
                    key={m.id}
                    type="button"
                    className={`model-dd-item ${active ? "active" : ""}`}
                    onClick={() => handleSelect(m.id)}
                    role="menuitem"
                  >
                    <div className="model-dd-item-left">
                      <div className="model-dd-item-top">
                        {/* ✅ ONLY name */}
                        <span className="model-dd-item-name">{m.name}</span>
                      </div>

                      {/* ✅ ONLY category */}
                      <div className="model-dd-item-sub">{m.category}</div>
                    </div>

                    {active && (
                      <span className="model-dd-check">
                        <FaCheck
                          size={16}
                          aria-label="Selected"
                          title="Selected"
                        />
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
