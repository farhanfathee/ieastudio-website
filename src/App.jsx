import { Routes, Route, useLocation } from 'react-router-dom'
import ScrollToTop from './components/ScrollToTop'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import BallpitBackground from './components/BallpitBackground'
import Home from './pages/Home'
import Services from './pages/Services'
import Project from './pages/Project'
import Contact from './pages/Contact'

function App() {
  const location = useLocation()
  const showBallpit = !['/project', '/services', '/contact'].includes(location.pathname)

  return (
    <>
      {/* Fixed ballpit canvas — hidden on project page */}
      {showBallpit && <BallpitBackground />}

      {/* All page content sits above the background */}
      <ScrollToTop />
      <div style={{ position: 'relative', zIndex: 1 }}>
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
