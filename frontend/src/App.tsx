import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import ChatScreen from "./components/ChatScreen";
import HeroSlider from "./components/HeroSlider";
import AdminLogin from "./screens/AdminLogin"; // make sure this path is correct
import Dashboard from "./screens/Dashboard"; // import the Dashboard component
import "./App.css";
import Profile from "./screens/Profile";
import AdminList from "./screens/AdminList";

export default function App() {
  return (
    <Router>
      <div className="app">
      

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
          <Route path="/admins-list" element={<AdminList />} />
          {/* dashboard route */}
          {/* other routes can go here */}
        </Routes>
      </div>
    </Router>
  );
}
