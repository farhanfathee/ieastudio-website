import useScrollReveal from '../hooks/useScrollReveal'
import './Home.css'

export default function Home() {
  useScrollReveal()

  return (
    <main className="home">

      {/* ── S1: Hero ── */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title reveal reveal-d1">
            <span className="hero-title-line">Immersive</span>
            <span className="hero-title-line">Realities</span>
          </h1>
          <p className="hero-desc reveal reveal-d3">
            We craft interactive experiences that bridge the physical and digital worlds.
            Through technology, art, and storytelling, we transform spaces into
            immersive environments.
          </p>
          <div className="hero-actions reveal reveal-d4">
            <a href="/project" className="btn-pill"><span>View Our Work</span></a>
            <a href="/contact" className="btn-pill"><span>Start a Project</span></a>
          </div>
        </div>
        <div className="hero-scroll-indicator reveal reveal-d5">
          <div className="hero-scroll-line" />
          <span>Scroll</span>
        </div>
      </section>

      {/* ── S2: Full-width video + text overlay ── */}
      <section className="section-showcase reveal-scale">
        <div className="showcase-video-wrap">
          <video
            src="/project002.mp4"
            autoPlay loop muted playsInline
            className="showcase-video"
          />
          <div className="showcase-overlay">
            <p className="showcase-label section-label">The Art of Engagement</p>
            <h2 className="showcase-heading">
              Our canvas is limitless. Across every medium,
              within every media — we engineer the overwhelming.
            </h2>
          </div>
        </div>
      </section>

      {/* ── S3: Split — text left, video right ── */}
      <section className="section-split">
        <div className="split-text reveal-left">
          <p className="section-label">Our Approach</p>
          <h2 className="split-heading">
            Our creativity transcends the frame.
          </h2>
          <p className="split-sub">
            Through spatial art and technical precision, we synchronize
            content, media, and environment into seamless experiences
            that captivate every sense.
          </p>
          <a href="/project" className="btn-pill"><span>Experience</span></a>
        </div>
        <div className="split-video-wrap reveal-right">
          <video
            src="/project006.mp4"
            autoPlay loop muted playsInline
            className="split-video"
          />
        </div>
      </section>

      {/* ── S4: Second full-width video ── */}
      <section className="section-showcase reveal-scale">
        <div className="showcase-video-wrap">
          <video
            src="/project005.mp4"
            autoPlay loop muted playsInline
            className="showcase-video"
          />
          <div className="showcase-overlay showcase-overlay--left">
            <p className="showcase-label section-label">Crafting the Unseen</p>
            <h2 className="showcase-heading">
              We don't just build experiences — we build worlds
              that blur the line between real and imagined.
            </h2>
          </div>
        </div>
      </section>

      {/* ── S5: Trusted by (Marquee) ── */}
      <section className="section-clients reveal">
        <p className="section-label clients-label">Trusted By</p>
        <div className="marquee-track">
          <div className="marquee-inner">
            {[1,2,3,4,5,6,7,8,9].map((n) => (
              <img key={n} src={`/logos/logo${n}.png`} alt={`Client ${n}`} className="marquee-logo" />
            ))}
            {[1,2,3,4,5,6,7,8,9].map((n) => (
              <img key={n + '-dup'} src={`/logos/logo${n}.png`} alt={`Client ${n}`} className="marquee-logo" />
            ))}
          </div>
        </div>
      </section>

      {/* ── S6: CTA ── */}
      <section className="section-cta">
        <div className="cta-content reveal">
          <p className="section-label">Ready to begin?</p>
          <h2 className="cta-title">
            Let's create something{' '}
extraordinary{' '}
            together
          </h2>
          <a href="/contact" className="btn-pill"><span>Start a Project</span></a>
        </div>
      </section>

    </main>
  )
}
