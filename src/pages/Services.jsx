import ParticleWhirlpool from '../components/ParticleWhirlpool'
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
  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <ParticleWhirlpool particleCount={2000} blur={0} />
      </div>
      <div className="services-page" style={{ position: 'relative', zIndex: 1 }}>
        <div className="services-hero">
          <h1 className="services-hero-title">Experience<br />Design</h1>
          <p className="services-hero-sub">We design and build immersive, interactive experiences that connect brands with audiences. From concept development to technical execution, we combine creativity and technology to deliver impactful installations, digital activations, and experiential environments.</p>
        </div>

        <div className="services-list">
          <p className="services-list-label">What we do</p>
          {services.map((s, i) => (
            <div className="service-item" key={i}>
              <div className="service-item-left">
                <span className="service-item-number">{String(i + 1).padStart(2, '0')}</span>
                <span className="service-item-title">{s.title}</span>
              </div>
              <p className="service-item-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
