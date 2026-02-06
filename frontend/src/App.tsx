import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import ChatScreen from "./components/ChatScreen";
import HeroSlider from "./components/HeroSlider";
import AdminLogin from "./screens/AdminLogin"; // make sure this path is correct
import Dashboard from "./screens/Dashboard"; // import the Dashboard component
import "./App.css";
import Profile from "./screens/Profile";

export default function App() {
  return (
    <Router>
      <div className="app">
        {/* Navbar */}
        <nav className="navbar">
          <div className="nav-left">mLab</div>
          <div className="nav-right">
            <Link to="/" className="nav-link">
              Home
            </Link>
            <Link to="/who-we-are" className="nav-link">
              Who We Are
            </Link>
            <Link to="/what-we-do" className="nav-link">
              What We Do
            </Link>
            <Link to="/partners" className="nav-link">
              Partners
            </Link>
            <Link to="/news" className="nav-link">
              News
            </Link>
            <Link to="/resources" className="nav-link">
              Resources
            </Link>
            <Link to="/contact" className="nav-link">
              Contact Us
            </Link>
            <Link to="/admin" className="nav-link">
              Admin
            </Link>
          </div>
        </nav>

        {/* Routes */}
        <Routes>
          <Route
            path="/"
            element={
              <>
                <HeroSlider />
                <ChatScreen />
              </>
            }
          />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/dashboard" element={<Dashboard />} />{" "}
          <Route path="/profile" element={<Profile />} />
          {/* dashboard route */}
          {/* other routes can go here */}
        </Routes>
      </div>
    </Router>
  );
}
