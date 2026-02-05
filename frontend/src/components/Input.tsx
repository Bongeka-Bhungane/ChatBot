import React from "react";
import "../css/inputComponentcss.css";

type InputProps = {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: React.HTMLInputTypeAttribute;
};

const Input: React.FC<InputProps> = ({
  placeholder,
  value,
  onChange,
  type = "text",
}) => {
  return (
    <input
      className="input"
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

export default Input;
