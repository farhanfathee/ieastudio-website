import { Link, NavLink } from 'react-router-dom'
import './Navbar.css'

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <img src="/logo1.png" alt="IEA Studio" className="navbar-logo-img" />
        </Link>

        <nav className="navbar-links">
          <NavLink to="/services">SERVICES</NavLink>
          <NavLink to="/project">PROJECT</NavLink>
          <NavLink to="/contact">CONTACT</NavLink>
        </nav>
      </div>
      <div className="navbar-border" />
    </header>
  )
}
