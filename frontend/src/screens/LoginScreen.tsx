import React, { useState } from "react";
import Input from "../components/Input";
import "../css/loginScreen.css";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Demo logic (replace with Firebase auth later)
    console.log("Email:", email);
    console.log("Password:", password);
  };

  return (
    <div className="login-container">
      <form className="login-card" onSubmit={handleSubmit}>
        <h2>Welcome back, please sign in</h2>

        <Input
          placeholder="Email address"
          value={email}
          onChange={setEmail}
          type="email"
        />

        <Input
          placeholder="Password"
          value={password}
          onChange={setPassword}
          type="password"
        />

        <button type="submit" className="login-btn">
          Sign in
        </button>
      </form>
    </div>
  );
};

export default Login;
