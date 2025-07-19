import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import '../../styles/Header.css'; 

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
      <nav className="header-nav">
        <Link to="/">Anime List</Link>
        <Link to="/profile">Profile</Link>
        <Link to="/forum">Forum</Link>
        <Link to="/lists">My Lists</Link>
      </nav>
      
      <div className="auth-links">
        {user ? (
          <button onClick={handleLogout} className="logout-button">
            Déconnexion
          </button>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;