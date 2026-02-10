// src/components/ModelDropdown.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import "../dropdown.css";
import { FaCheck } from "react-icons/fa";
import { Models, type ChatModel, MODEL_META } from "../types/Chat";

type ModelDropdownProps = {
  model: ChatModel;
  setModel: (model: ChatModel) => void;
  onClose?: () => void; // optional close function
};

export default function ModelDropdown({
  model,
  setModel,
}: ModelDropdownProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const current = useMemo(() => MODEL_META[model], [model]);

  // Optional: mark which ones are "New" (edit as you like)
  

  const handleSelect = (m: ChatModel) => {
    setModel(m);
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
        <span className="model-dd-trigger-title">{current.label}</span>

        <span className={`model-dd-chevron ${open ? "open" : ""}`} aria-hidden>
          ▾
        </span>
      </button>

      {/* Popover */}
      {open && (
        <div className="model-dd-popover" role="menu">
          <div className="model-dd-header">Models</div>

          <div className="model-dd-list">
            {Models.map((m) => {
              const meta = MODEL_META[m];
              const active = m === model;

              return (
                <button
                  key={m}
                  type="button"
                  className={`model-dd-item ${active ? "active" : ""}`}
                  onClick={() => handleSelect(m)}
                  role="menuitem"
                >
                  <div className="model-dd-item-left">
                    <div className="model-dd-item-top">
                      <span className="model-dd-item-name">{meta.label}</span>

              
                    </div>

                    <div className="model-dd-item-sub">{meta.description}</div>
                  </div>

                  {active && <span className="model-dd-check">
                    <FaCheck size={16} aria-label="Selected" title="Selected" />
                    </span>}
                </button>
              );
            })}
          </div>

          
        </div>
      )}
    </div>
  );
}
