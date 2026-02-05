import ChatScreen from "../src/components/ChatScreen";
import "./App.css";
import HeroSlider from "./components/HeroSlider";

export default function App() {
  return (
    <div className="app">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-left">mLab</div>
        <div className="nav-right">
          <a href="/" className="nav-link">
            Home
          </a>
          <a href="/who-we-are" className="nav-link">
            Who We Are
          </a>
          <a href="/what-we-do" className="nav-link">
            What We Do
          </a>
          <a href="/partners" className="nav-link">
            Partners
          </a>
          <a href="/news" className="nav-link">
            News
          </a>
          <a href="/resources" className="nav-link">
            Resources
          </a>
          <a href="/contact" className="nav-link">
            Contact Us
          </a>
          <a href="/admin" className="nav-link">
            Admin
          </a>
        </div>
      </nav>

      <HeroSlider />
      {/* Chatbot */}
      <ChatScreen />
    </div>
  );
}
