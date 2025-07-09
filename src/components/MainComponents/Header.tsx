import { Link } from "react-router-dom"
import '../../styles/Header.css'; 

const Header = () => {

    return (
        <div>
<h1>
    
</h1>

        <nav>
            <Link to="/">Anime List</Link>

        <Link to="/login">Login</Link>

        <Link to="/register">Register</Link>
        
        <Link to="/profile">Profile</Link>

        <Link to="/forum">Forum</Link>

        <Link to="/lists">My Lists</Link>
        </nav>
      
        </div>
    )
}

export default Header