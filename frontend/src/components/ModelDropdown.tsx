// src/components/ModelDropdown.tsx
import "../dropdown.css";

export type ChatModel = "GPT-4" | "Claude" | "Gemini" | "Local";

type ModelDropdownProps = {
  model: ChatModel;
  setModel: (model: ChatModel) => void;
  onClose?: () => void; // optional close function
};

export default function ModelDropdown({
  model,
  setModel,
  onClose,
}: ModelDropdownProps) {
  return (
    <div className="model-dropdown-container">
      <select
        className="model-dropdown"
        value={model}
        onChange={(e) => setModel(e.target.value as ChatModel)}
      >
        <option value="GPT-4">GPT-4</option>
        <option value="Claude">Claude</option>
        <option value="Gemini">Gemini</option>
        <option value="Local">Local Model</option>
      </select>

      {onClose && (
        <button className="dropdown-close-btn" onClick={onClose}>
          ✖
        </button>
      )}
    </div>
  );
}
