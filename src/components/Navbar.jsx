import { useState, useEffect, useCallback } from 'react'
import { Link, NavLink } from 'react-router-dom'
import './Navbar.css'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const toggleMenu = useCallback(() => {
    setMenuOpen((prev) => {
      document.body.classList.toggle('menu-open', !prev)
      return !prev
    })
  }, [])

  const closeMenu = useCallback(() => {
    setMenuOpen(false)
    document.body.classList.remove('menu-open')
  }, [])

  useEffect(() => {
    let lastY = window.scrollY

    const onScroll = () => {
      const y = window.scrollY
      setHidden(y > lastY && y > 100)
      setScrolled(y > 20)
      lastY = y
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header
        className={`navbar${scrolled ? ' navbar--scrolled' : ''}${hidden ? ' navbar--hidden' : ''}`}
      >
        <div className="navbar-inner">
          <Link to="/" className="navbar-logo" onClick={closeMenu}>
            <img src="/logo1.png" alt="IEA Studio" className="navbar-logo-img" />
          </Link>

          <nav className="navbar-links">
            <NavLink to="/services">Services</NavLink>
            <NavLink to="/project">Work</NavLink>
            <NavLink to="/contact" className="btn-pill navbar-cta">
              <span>Let's Talk</span>
            </NavLink>
          </nav>

          <button
            className={`navbar-hamburger${menuOpen ? ' active' : ''}`}
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      {/* Mobile fullscreen overlay */}
      <div className={`mobile-menu${menuOpen ? ' mobile-menu--open' : ''}`}>
        <nav className="mobile-menu-nav">
          <NavLink to="/" onClick={closeMenu} className="mobile-menu-link">
            <span className="mobile-menu-num">01</span>
            <span className="mobile-menu-label">Home</span>
          </NavLink>
          <NavLink to="/services" onClick={closeMenu} className="mobile-menu-link">
            <span className="mobile-menu-num">02</span>
            <span className="mobile-menu-label">Services</span>
          </NavLink>
          <NavLink to="/project" onClick={closeMenu} className="mobile-menu-link">
            <span className="mobile-menu-num">03</span>
            <span className="mobile-menu-label">Work</span>
          </NavLink>
          <NavLink to="/contact" onClick={closeMenu} className="mobile-menu-link">
            <span className="mobile-menu-num">04</span>
            <span className="mobile-menu-label">Contact</span>
          </NavLink>
        </nav>
        <div className="mobile-menu-footer">
          <p>hello@ieastudio.com</p>
        </div>
      </div>
    </>
  )
}
