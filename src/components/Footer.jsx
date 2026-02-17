import { Link, useLocation } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  const location = useLocation()
  const isContact = location.pathname === '/contact'

  return (
    <footer className={`footer${isContact ? ' footer--transparent' : ''}`}>
      <div className="footer-gradient-line" />

      <div className="footer-main">
        <div className="footer-brand">
          <Link to="/">
            <img src="/logo1.png" alt="IEA Studio" className="footer-logo-img" />
          </Link>
          <p className="footer-tagline">
            Crafting immersive experiences at the intersection of art and technology.
          </p>
        </div>

        <div className="footer-col">
          <h4 className="footer-col-title">Navigate</h4>
          <nav className="footer-col-links">
            <Link to="/">Home</Link>
            <Link to="/services">Services</Link>
            <Link to="/project">Work</Link>
            <Link to="/contact">Contact</Link>
          </nav>
        </div>

        <div className="footer-col">
          <h4 className="footer-col-title">Connect</h4>
          <nav className="footer-col-links">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="mailto:hello@ieastudio.com">Email</a>
          </nav>
        </div>
      </div>

      <div className="footer-divider" />

      <div className="footer-bottom">
        <span className="footer-copy">&copy; {new Date().getFullYear()} IEA Studio. All rights reserved.</span>
        <nav className="footer-legal">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
        </nav>
      </div>
    </footer>
  )
}
