import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ChatScreen from "./components/ChatScreen";
import HeroSlider from "./components/HeroSlider";
import AdminLogin from "./screens/AdminLogin"; // make sure this path is correct
import Dashboard from "./screens/Dashboard"; // import the Dashboard component
import "./App.css";
import Profile from "./screens/Profile";
import AdminList from "./screens/AdminList";
import ModelsScreen from "./screens/ModelsScreen";
import FAQScreen from "./screens/FAQScreen";

export default function App() {
  return (
    <Router>
      <div className="app">
        {/* Navbar */}

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
          <Route path="/models" element={<ModelsScreen />} />
          <Route path="/faqs" element={<FAQScreen />} />
          {/* dashboard route */}
          {/* other routes can go here */}
        </Routes>
      </div>
    </Router>
  );
}
