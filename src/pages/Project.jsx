import { useEffect, useRef } from 'react'
import SplashCursorBackground from '../components/SplashCursorBackground'
import useScrollReveal from '../hooks/useScrollReveal'
import './Project.css'

const projects = [
  { id: 1, title: 'International Museum Day', category: 'Installation', date: 'MAR 2024', src: '/project001.mp4' },
  { id: 2, title: 'Vuse Touchwall',           category: 'Interactive',   date: 'MAY 2024', src: '/project002.mp4' },
  { id: 3, title: 'Particles Motion',         category: 'Digital Art',   date: 'JUN 2024', src: '/project003.mp4' },
  { id: 4, title: 'NARS Arcade Game',         category: 'Activation',    date: 'AUG 2024', src: '/project004.mp4' },
  { id: 5, title: 'Guardian of the Galaxy',   category: 'Projection',    date: 'SEP 2024', src: '/project005.mp4' },
  { id: 6, title: 'Pezta Interactive Wall',   category: 'Interactive',   date: 'NOV 2024', src: '/project006.mp4' },
]

function ProjectCard({ project, index }) {
  const videoRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const onLoaded = () => {
      video.currentTime = Math.random() * video.duration
      video.pause()
    }

    video.addEventListener('loadedmetadata', onLoaded)
    return () => video.removeEventListener('loadedmetadata', onLoaded)
  }, [])

  const handleMouseEnter = () => videoRef.current?.play()
  const handleMouseLeave = () => videoRef.current?.pause()

  return (
    <div
      className="project-card reveal"
      style={{ transitionDelay: `${0.08 * index}s` }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <video
        ref={videoRef}
        src={project.src}
        muted
        playsInline
        loop
        preload="metadata"
      />
      <div className="project-card-tint" />
      <div className="project-card-info">
        <div className="project-card-meta">
          <span className="project-card-category">{project.category}</span>
          <span className="project-card-date">{project.date}</span>
        </div>
        <h3 className="project-card-title">{project.title}</h3>
      </div>
      <div className="project-card-border" />
    </div>
  )
}

export default function Project() {
  useScrollReveal()

  return (
    <>
      <SplashCursorBackground />
      <div className="project-page" style={{ position: 'relative', zIndex: 1 }}>
        <div className="project-hero">
          <p className="section-label reveal reveal-d1">Portfolio</p>
          <h1 className="project-hero-title reveal reveal-d2">
            <span>Featured</span>
            <span>Works</span>
          </h1>
          <p className="project-hero-sub reveal reveal-d3">
            From immersive installations to avant-garde digital art.
            We curate experiences that react, respond, and resonate.
          </p>
        </div>
        <div className="project-grid">
          {projects.map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i} />
          ))}
        </div>
      </div>
    </>
  )
}
