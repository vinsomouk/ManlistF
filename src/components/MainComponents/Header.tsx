import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import '../../styles/MainComponents/Header.css';

const Header = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  return (
    <header className="header-container">
      <div className="header-content">
        <nav className="main-nav">
          <div className="nav-links-container">
            <Link to="/" className="nav-link">Anime List</Link>
            <Link to="/profile" className="nav-link">Profile</Link>
            <Link to="/forum" className="nav-link">Forum</Link>
            <Link to="/lists" className="nav-link">My Lists</Link>
          </div>
        </nav>
        
        <div className="auth-section">
          {user ? (
            <button onClick={handleLogout} className="logout-btn">
              Déconnexion
            </button>
          ) : (
            <>
              <Link to="/login" className="auth-link login">Login</Link>
              <Link to="/register" className="auth-link register">Register</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;