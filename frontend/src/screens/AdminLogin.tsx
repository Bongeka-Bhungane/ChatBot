import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../AdminLogin.css";
import Input from "../components/Input";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await fetch("http://localhost:5000/api/admins/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Login failed");
        return;
      }

      localStorage.setItem("admin", JSON.stringify(data.admin));

      navigate("/dashboard");
    } catch (err) {
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="login-card">
        <h2>Admin Login</h2>

        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={setEmail}
          />

          <label>Password</label>
          <Input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={setPassword}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
