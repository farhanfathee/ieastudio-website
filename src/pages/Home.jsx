import './Home.css'

export default function Home() {
  return (
    <main className="home">

      {/* ── S1: Hero — centered text, ballpit fills bottom ── */}
      <section className="section-hero">
        <div className="hero-content">
          <h1 className="hero-title">
            IMMERSIVE<br />REALITIES
          </h1>
          <p className="hero-desc">
            We are a creative technology studio crafting interactive experiences that bridge the
            physical and digital worlds. Through technology, art, and storytelling, we transform
            spaces into immersive environments.
          </p>
        </div>
      </section>

      {/* ── S2: Full-width video + text overlay ── */}
      <section className="section-fullvideo">
        <video
          src="/project002.mp4"
          autoPlay loop muted playsInline
          className="fullvideo-vid"
        />
        <div className="fullvideo-overlay">
          <p className="fullvideo-sub">Crafting the art of engagement.</p>
          <h2 className="fullvideo-heading">
            Our canvas is limitless. Across every medium, within<br />
            every media. We engineer the overwhelming.
          </h2>
        </div>
      </section>

      {/* ── S3: Left text + Right tall portrait video ── */}
      <section className="section-split">
        <div className="split-text">
          <h2 className="split-heading">Our creativity transcends the frame.</h2>
          <p className="split-sub">
            Through spatial art and technical precision, we<br />
            synchronize content, media, and environment.
          </p>
          <a href="/project" className="btn-pill">EXPERIENCE</a>
        </div>
        <div className="split-video-wrap">
          <video
            src="/project006.mp4"
            autoPlay loop muted playsInline
            className="split-video"
          />
        </div>
      </section>

      {/* ── S4: Full-width video + text overlay ── */}
      <section className="section-fullvideo">
        <video
          src="/project005.mp4"
          autoPlay loop muted playsInline
          className="fullvideo-vid"
        />
        <div className="fullvideo-overlay">
          <p className="fullvideo-sub">Crafting the unseen.</p>
          <h2 className="fullvideo-heading">
            Our canvas is limitless. Across every medium, within<br />
            every media. We engineer the overwhelming.
          </h2>
        </div>
      </section>

      {/* ── S5: Trusted by ── */}
      <section className="section-trusted">
        <p className="trusted-label">Our clients</p>
        <div className="marquee-track">
          <div className="marquee-inner">
            {[1,2,3,4,5,6,7,8,9].map((n) => (
              <img key={n} src={`/logos/logo${n}.png`} alt={`client logo ${n}`} className="marquee-logo" />
            ))}
            {[1,2,3,4,5,6,7,8,9].map((n) => (
              <img key={n + '-dup'} src={`/logos/logo${n}.png`} alt={`client logo ${n}`} className="marquee-logo" />
            ))}
          </div>
        </div>
      </section>

      {/* ── S6: Contact CTA ── */}
      <section className="section-contact">
        <div className="contact-content">
          <h2 className="contact-title">
            Let's create something<br />extraordinary together
          </h2>
          <a href="/contact" className="btn-pill contact-btn">START A PROJECT</a>
        </div>
      </section>

    </main>
  )
}
