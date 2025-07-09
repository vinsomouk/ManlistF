import { Link } from "react-router-dom"
import '../../styles/Header.css'; 

const Header = () => {
  return (
    <header className="header-container">
      <nav className="header-nav">
        <Link to="/">Anime List</Link>
        <Link to="/profile">Profile</Link>
        <Link to="/forum">Forum</Link>
        <Link to="/lists">My Lists</Link>
      </nav>
      
      <div className="auth-links">
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
      </div>
    </header>
  );
}

export default Header