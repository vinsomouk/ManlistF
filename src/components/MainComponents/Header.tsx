import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useMenu } from "../../context/MenuContext";
import "../../styles/MainComponents/Header.css";

const Header = () => {
  const { user, logout } = useAuth();
  const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu, toggleSidebar } = useMenu();

  const handleLogout = async () => {
    try {
      await logout();
      closeMobileMenu();
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  return (
    <header className="header-container">
      <div className="header-content">
        <nav className="main-nav">
          {/* Bouton pour ouvrir/fermer la sidebar sur mobile */}
          <button 
            className="sidebar-toggle" 
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 18H21V16H3V18ZM3 13H21V11H3V13ZM3 6V8H21V6H3Z" fill="white"/>
            </svg>
          </button>

          <div
            className={`nav-links-container ${isMobileMenuOpen ? "active" : ""}`}
            onClick={closeMobileMenu}
          >
            <Link to="/" className="nav-link">
              Anime List
            </Link>
            <Link to="/profile" className="nav-link">
              Profile
            </Link>
            <Link to="/forum" className="nav-link">
              Forum
            </Link>
            <Link to="/lists" className="nav-link">
              My Lists
            </Link>
          </div>

          <div
            className={`burger-menu ${isMobileMenuOpen ? "active" : ""}`}
            onClick={toggleMobileMenu}
            aria-label="Menu navigation"
          >
            <span className="burger-line"></span>
            <span className="burger-line"></span>
            <span className="burger-line"></span>
          </div>
        </nav>

        <div className="auth-section">
          {user ? (
            <button onClick={handleLogout} className="logout-btn">
              Déconnexion
            </button>
          ) : (
            <>
              <Link to="/login" className="auth-link login">
                Login
              </Link>
              <Link to="/register" className="auth-link register">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;