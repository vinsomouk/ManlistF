import { Link } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth"
import { useMenu } from "../../context/MenuContext"
import '../../styles/MainComponents/Header.css'

const Header = () => {
  const { user, logout } = useAuth()
  const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useMenu()

  const handleLogout = async () => {
    try {
      await logout()
      closeMobileMenu()
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error)
    }
  }

  return (
    <header className="header-container">
      <div className="header-content">
        <nav className="main-nav">
          <div 
            className={`nav-links-container ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            <Link to="/" className="nav-link">Anime List</Link>
            <Link to="/profile" className="nav-link">Profile</Link>
            <Link to="/forum" className="nav-link">Forum</Link>
            <Link to="/lists" className="nav-link">My Lists</Link>
          </div>
          
          <div 
            className={`burger-menu ${isMobileMenuOpen ? 'active' : ''}`} 
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
              <Link to="/login" className="auth-link login">Login</Link>
              <Link to="/register" className="auth-link register">Register</Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header