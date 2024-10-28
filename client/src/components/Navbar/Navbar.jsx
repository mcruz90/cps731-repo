import { Link } from 'react-router-dom'; 
import { useAuth } from '@/hooks/useAuth'; 
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, isAdmin, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar__container">
        <Link to="/" id="navbar__logo">
          <i className="fa-solid fa-yin-yang"></i> Serenity
        </Link>

        <div className="navbar__toggle" id="mobile-menu">
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>

        <ul className="navbar__menu">
          <li className="navbar__item">
            <Link to="/" className="navbar__links">
              Home
            </Link>
          </li>
          
          <li className="navbar__item">
            <Link to="/about" className="navbar__links">
              About
            </Link>
          </li>

          {isAuthenticated && (
            <>
              <li className="navbar__item">
                <Link to="/schedule" className="navbar__links">
                  Schedule
                </Link>
              </li>

              {isAdmin && (
                <li className="navbar__item">
                  <Link to="/finances" className="navbar__links">
                    Finances
                  </Link>
                </li>
              )}

              <li className="navbar__item">
                <button 
                  onClick={logout}
                  className="navbar__links"
                >
                  Logout
                </button>
              </li>
            </>
          )}

          {!isAuthenticated && (
            <li className="navbar__btn">
              <Link to="/login" className="button">
                Login
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;