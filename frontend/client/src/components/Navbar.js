import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  FiMenu, FiX, FiUser, FiSettings, FiLogOut,
  FiHelpCircle, FiHome, FiTrello, FiUsers, FiCheckCircle
} from "react-icons/fi";
import '../assets/styles/NavbarFooter.css';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userData, setUserData] = useState({ name: "", role: "" });
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log("Decoded token:", decoded); // Debug
        setUserData({ name: decoded.name, role: decoded.role });
      } catch (error) {
        console.error("Invalid token");
      }
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUserData({ name: "", role: "" }); // CLEAR userData
    setShowDropdown(false);
    setIsOpen(false);
    navigate("/");
  };

  const closeMenu = () => setIsOpen(false);

  return (
    <header className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/" onClick={closeMenu}>
            <span className="logo-icon">🔧</span>
            <span className="logo-text">SupportPro</span>
          </Link>
        </div>

        <div className={`navbar-links ${isOpen ? "active" : ""}`}>
          <nav className="main-nav">
            <NavItem to="/" icon={<FiHome />} text="Home" onClick={closeMenu} active={location.pathname === "/"} />
            <NavItem to="/features" icon={<FiCheckCircle />} text="Features" onClick={closeMenu} />
            <NavItem to="/how-it-works" icon={<FiHelpCircle />} text="How It Works" onClick={closeMenu} />

            {userData.role === "user" && (
              <NavItem to="/my-tickets" icon={<FiTrello />} text="My Tickets" onClick={closeMenu} />
            )}
            {userData.role === "agent" && (
              <NavItem to="/agent-panel" icon={<FiUsers />} text="Assigned Tickets" onClick={closeMenu} />
            )}
            {userData.role === "admin" && (
              <>
                <NavItem to="/admin" icon={<FiTrello />} text="All Tickets" onClick={closeMenu} />
                <NavItem to="/solved-tickets" icon={<FiCheckCircle />} text="Solved Tickets" onClick={closeMenu} />
              </>
            )}
          </nav>

          <div className="user-section">
            {userData.name ? (
              <div className="user-dropdown">
                <button className="user-button" onClick={() => setShowDropdown(!showDropdown)}>
                  <FiUser className="user-icon" />
                  <span className="user-name">{userData.name}</span>
                </button>

                {showDropdown && (
                  <div className="dropdown-menu show">
                    <Link to="/profile" className="dropdown-item" onClick={() => { setShowDropdown(false); closeMenu(); }}>
                      <FiUser className="menu-icon" /> Profile
                    </Link>
                    <Link to="/settings" className="dropdown-item" onClick={() => { setShowDropdown(false); closeMenu(); }}>
                      <FiSettings className="menu-icon" /> Settings
                    </Link>
                    <button className="dropdown-item logout" onClick={handleLogout}>
                      <FiLogOut className="menu-icon" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="btn login-btn" onClick={closeMenu}>Login</Link>
                <Link to="/register" className="btn register-btn" onClick={closeMenu}>Register</Link>
              </div>
            )}
          </div>
        </div>

        <button className="navbar-toggle" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>
    </header>
  );
}

const NavItem = ({ to, icon, text, onClick, active }) => (
  <Link to={to} className={`nav-item ${active ? "active" : ""}`} onClick={onClick}>
    <span className="nav-icon">{icon}</span>
    <span className="nav-text">{text}</span>
  </Link>
);

export default Navbar;
