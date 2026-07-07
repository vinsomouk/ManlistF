import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useMenu } from "../../context/MenuContext";
import defaultAvatar from "../../assets/braver-blank-pfp.jpg";
import "../../styles/MainComponents/Header.css";

const API_BASE_URL = "http://localhost:8000";

const getImageUrl = (path?: string | null) => {
  if (!path) return defaultAvatar;
  if (path.startsWith("http")) return path;
  return `${API_BASE_URL}${path}`;
};

const Header = () => {
  const { user, logout } = useAuth();
  const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu, toggleSidebar } = useMenu();

  const handleLogout = async () => {
    try {
      await logout();
      closeMobileMenu();
      window.location.href = "/login";
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  return (
    <header className="header-container">
      <div className="header-content">
        <nav className="main-nav">
          <button
            className="sidebar-toggle"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 18H21V16H3V18ZM3 13H21V11H3V13ZM3 6V8H21V6H3Z"
                fill="white"
              />
            </svg>
          </button>

          <div
            className={`nav-links-container ${isMobileMenuOpen ? "active" : ""}`}
            onClick={closeMobileMenu}
          >
            <Link to="/" className="nav-link">Accueil</Link>
            <Link to="/profile" className="nav-link">Profil</Link>
            <Link to="/forum" className="nav-link">Forum</Link>
            <Link to="/lists" className="nav-link">Ma liste</Link>
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

        <div className="header-auth-section">
          {user ? (
            <div className="header-user">
              <img
                src={getImageUrl(user.profilePicture)}
                alt="avatar"
                className="header-avatar"
              />

              <button onClick={handleLogout} className="logout-btn">
                Déconnexion
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="auth-link login">
                Se connecter
              </Link>
              <Link to="/register" className="auth-link register">
                S'inscrire
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;