import { useState } from "react";
import { useNavigate } from "react-router-dom"; // <-- import useNavigate
import "../AdminLogin.css";
import Input from "../components/Input";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // <-- initialize navigate

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Replace this with actual login logic
    // Example: if login successful, navigate to dashboard
    if (email && password) {
      // You can also add real authentication logic here
      navigate("/dashboard"); // <-- redirect to dashboard
    } else {
      alert("Please enter email and password");
    }
  };

  return (
    <div className="admin-login-container">
      <div className="login-card">
        <h2>Admin Login</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <Input
            type="email"
            id="email"
            placeholder="Enter your email"
            value={email}
            onChange={setEmail}
          />

          <label htmlFor="password">Password</label>
          <Input
            type="password"
            id="password"
            placeholder="Enter your password"
            value={password}
            onChange={setPassword}
          />

          <button type="submit">Login</button>
        </form>
        <a href="#" className="forgot-password">
          Forgot Password?
        </a>
      </div>
    </div>
  );
}
