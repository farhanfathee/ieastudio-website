import { useState, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import ScrollToTop from './components/ScrollToTop'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import BallpitBackground from './components/BallpitBackground'
import MobileDisclaimer from './components/MobileDisclaimer'
import Home from './pages/Home'
import Services from './pages/Services'
import Project from './pages/Project'
import Contact from './pages/Contact'

function App() {
  const location = useLocation()
  const showBallpit = !['/project', '/services', '/contact'].includes(location.pathname)

  const [showDisclaimer, setShowDisclaimer] = useState(false)

  useEffect(() => {
    const isMobile = window.innerWidth <= 768 ||
      ('ontouchstart' in window && window.innerWidth <= 1024)
    const dismissed = sessionStorage.getItem('mobile-disclaimer-dismissed')
    if (isMobile && !dismissed) setShowDisclaimer(true)
  }, [])

  const handleDismiss = () => {
    sessionStorage.setItem('mobile-disclaimer-dismissed', '1')
    setShowDisclaimer(false)
  }

  if (showDisclaimer) return <MobileDisclaimer onContinue={handleDismiss} />

  return (
    <>
      {/* All page content sits above the background */}
      <ScrollToTop />
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Ballpit inside wrapper so blend modes work */}
        {showBallpit && <BallpitBackground />}
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/project" element={<Project />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
        <Footer />
      </div>
    </>
  )
}

export default App
