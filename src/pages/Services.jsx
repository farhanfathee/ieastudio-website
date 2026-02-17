import ParticleWhirlpool from '../components/ParticleWhirlpool'
import useScrollReveal from '../hooks/useScrollReveal'
import './Services.css'

const services = [
  {
    title: 'Interactive Installations',
    desc: 'Sensor-driven environments that respond to human presence and movement in real time.',
  },
  {
    title: 'Projection Mapping',
    desc: 'Transforming architectural surfaces into dynamic visual canvases.',
  },
  {
    title: 'Digital Activations',
    desc: 'Brand experiences that merge physical space with digital storytelling.',
  },
  {
    title: 'Artificial Intelligence',
    desc: 'End-to-end concept development and spatial design for immersive environments.',
  },
  {
    title: 'Content Creation',
    desc: 'Bespoke visual content crafted for installations, events, and campaigns.',
  },
]

export default function Services() {
  useScrollReveal()

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <ParticleWhirlpool particleCount={2000} blur={0} />
      </div>
      <div className="services-page" style={{ position: 'relative', zIndex: 1 }}>
        <div className="services-hero">
          <p className="section-label reveal reveal-d1">What We Do</p>
          <h1 className="services-hero-title reveal reveal-d2">
            <span>Experience</span>
            <span>Design</span>
          </h1>
          <p className="services-hero-sub reveal reveal-d3">
            We design and build immersive, interactive experiences that connect brands
            with audiences. From concept to technical execution, we combine creativity
            and technology to deliver impactful results.
          </p>
        </div>

        <div className="services-list">
          <p className="services-list-label section-label reveal">Our Capabilities</p>
          {services.map((s, i) => (
            <div className="service-item reveal" key={i} style={{ transitionDelay: `${0.05 * i}s` }}>
              <div className="service-item-left">
                <span className="service-item-number">{String(i + 1).padStart(2, '0')}</span>
                <span className="service-item-title">{s.title}</span>
              </div>
              <p className="service-item-desc">{s.desc}</p>
              <div className="service-item-gradient-line" />
            </div>
          ))}
        </div>

        <div className="services-cta reveal">
          <h2 className="services-cta-title">
            Have a project in mind?
          </h2>
          <a href="/contact" className="btn-pill"><span>Get in Touch</span></a>
        </div>
      </div>
    </>
  )
}
