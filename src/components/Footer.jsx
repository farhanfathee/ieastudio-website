import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-logo-row">
        <Link to="/">
          <img src="/logo1.png" alt="IEA Studio" className="footer-logo-img" />
        </Link>
      </div>
      <div className="footer-divider" />
      <div className="footer-bottom">
        <span className="footer-copy">© 2024 IEA STUDIO.  ALL RIGHTS RESERVED.</span>
        <nav className="footer-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Cookies Settings</a>
        </nav>
      </div>
    </footer>
  )
}
