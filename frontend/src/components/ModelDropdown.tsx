// src/components/ModelDropdown.tsx
import "../dropdown.css";
import { Models, type ChatModel } from "../types/Chat";

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
        {Models.map((model) => (
          <option key={model} value={model}>
            {model.charAt(0).toUpperCase() + model.slice(1)}
          </option>
        ))}
      </select>

      {onClose && (
        <button className="dropdown-close-btn" onClick={onClose}>
          ✖
        </button>
      )}
    </div>
  );
}
