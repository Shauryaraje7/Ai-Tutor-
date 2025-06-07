import { Link, useLocation, useNavigate } from "react-router-dom";
import { auth } from "../firebase"; // Adjust path to your firebase.js
import { signOut } from "firebase/auth";
import "../styles/Sidebar.css";

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      alert("Signed out successfully!");
      navigate("/"); // Redirect to Auth page after sign-out
    } catch (error) {
      alert("Error signing out: " + error.message);
    }
  };

  return (
    <div className="sidebar">
      {/* Logo */}
      <div className="logo">
        <div className="logo-icon">F</div>
        <h1>FAUGET</h1>
      </div>

      {/* Navigation Links */}
      <nav className="nav-links">
        <Link
          to="/dashboard" // Changed from "/" to "/dashboard"
          className={`nav-link ${location.pathname === "/dashboard" ? "active" : ""}`}
        >
          <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
          Dashboard
        </Link>
        <Link
          to="/progress"
          className={`nav-link ${location.pathname === "/progress" ? "active" : ""}`}
        >
          <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Progress
        </Link>
        <Link
          to="/profile"
          className={`nav-link ${location.pathname === "/profile" ? "active" : ""}`}
        >
          <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Profile
        </Link>
        <Link
          to="/exam-preparation"
          className={`nav-link ${location.pathname === "/exam-preparation" ? "active" : ""}`}
        >
          <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Exam Preparation
        </Link>
      </nav>

      {/* Sign Out and Help */}
      <div className="footer-links">
        <button className="footer-link" onClick={handleSignOut}>
          <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
        <button className="footer-link" onClick={() => alert("Help feature coming soon!")}>
          <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Help
        </button>
      </div>
    </div>
  );
}

export default Sidebar;