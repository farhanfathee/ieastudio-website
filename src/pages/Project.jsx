import { useEffect, useRef } from 'react'
import SplashCursorBackground from '../components/SplashCursorBackground'
import './Project.css'

const projects = [
  { id: 1, title: 'International Museum Day', date: 'MAR 2024', src: '/project001.mp4' },
  { id: 2, title: 'Vuse Touchwall',           date: 'MAY 2024', src: '/project002.mp4' },
  { id: 3, title: 'Particles Motion',         date: 'JUN 2024', src: '/project003.mp4' },
  { id: 4, title: 'NARS Arcade Game',         date: 'AUG 2024', src: '/project004.mp4' },
  { id: 5, title: 'Guardian of the Galaxy',   date: 'SEP 2024', src: '/project005.mp4' },
  { id: 6, title: 'Pezta Interactive Wall',   date: 'NOV 2024', src: '/project006.mp4' },
]

function ArchiveCard({ project }) {
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
      className="archive-card"
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
      <div className="archive-card-tint" />
      <div className="archive-card-info">
        <div className="archive-card-title">{project.title}</div>
        <div className="archive-card-date">{project.date}</div>
      </div>
    </div>
  )
}

export default function Project() {
  return (
    <>
      <SplashCursorBackground />
      <div className="project-page" style={{ position: 'relative', zIndex: 1 }}>
        <div className="project-hero">
          <h1 className="project-hero-title">Featured<br />Works</h1>
          <p className="project-hero-sub">From immersive installations to avant-garde digital art. We curate experiences that react, respond, and resonate.</p>
        </div>
        <div className="archive-grid">
          {projects.map((p) => (
            <ArchiveCard key={p.id} project={p} />
          ))}
        </div>
      </div>
    </>
  )
}
