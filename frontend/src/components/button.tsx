import React from "react";
import "../css/buttonComponentcsss.css";

type ButtonVariant = "primary" | "delete" | "default";

type ButtonProps = {
  text?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  variant?: ButtonVariant;
  icon?: React.ReactNode;
  disabled?: boolean;
};

const Button: React.FC<ButtonProps> = ({
  text,
  onClick,
  type = "button",
  variant = "default",
  icon,
  disabled = false,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
    >
      {icon && <span className="btn-icon">{icon}</span>}
      <span>{text}</span>
    </button>
  );
};

export default Button;
