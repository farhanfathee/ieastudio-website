import { useState } from 'react'
import useScrollReveal from '../hooks/useScrollReveal'
import Robot3D from '../components/Robot3D'
import './Contact.css'

function ContactForm() {
  const [status, setStatus] = useState('idle')

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('sending')
    const formData = new FormData(e.target)
    try {
      const res = await fetch('https://formsubmit.co/ajax/farhanfathee@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.fromEntries(formData)),
      })
      const data = await res.json()
      if (data.success) {
        setStatus('success')
        e.target.reset()
        window.dispatchEvent(new Event('robot-thumbsup'))
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <form className="contact-form glass-card" onSubmit={handleSubmit}>
      <input type="hidden" name="_subject" value="New Inquiry — IEA Studio" />
      <input type="hidden" name="_captcha" value="false" />

      <div className="contact-form-grid">
        <div className="contact-input-group">
          <label>Your Name *</label>
          <input type="text" name="name" placeholder="John Doe" required />
        </div>
        <div className="contact-input-group">
          <label>Email *</label>
          <input type="email" name="email" placeholder="john@example.com" required />
        </div>
        <div className="contact-input-group">
          <label>Company / Organization</label>
          <input type="text" name="company" placeholder="Your Company Name" />
        </div>
        <div className="contact-input-group">
          <label>Budget Range *</label>
          <select name="budget" required defaultValue="">
            <option value="" disabled>Select budget range</option>
            <option value="5k-10k">RM5,000 – RM10,000</option>
            <option value="10k-20k">RM10,000 – RM20,000</option>
            <option value="20k-50k">RM20,000 – RM50,000</option>
            <option value="50k+">RM50,000 and above</option>
          </select>
        </div>
        <div className="contact-input-group full">
          <label>Project Details *</label>
          <textarea name="message" rows={5} placeholder="Tell us about your project, timeline, and vision..." required />
        </div>
      </div>

      <button
        type="submit"
        className="btn-pill contact-submit-btn"
        disabled={status === 'sending'}
        data-status={status}
      >
        <span>
          {status === 'idle' && 'Send Inquiry'}
          {status === 'sending' && 'Sending...'}
          {status === 'success' && 'Submitted!'}
          {status === 'error' && 'Error — Try Again'}
        </span>
        {status === 'idle' && (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        )}
      </button>
    </form>
  )
}

export default function Contact() {
  useScrollReveal()

  return (
    <>
      <div style={{ position: 'fixed', left: 0, right: 0, bottom: '-10%', height: '50%', zIndex: 0, background: '#050505' }}>
        <Robot3D />
      </div>
      <div className="contact-page contact-page--overlay" style={{ position: 'relative', zIndex: 2 }}>
        <div className="contact-inner">
          <div className="contact-hero reveal-clip">
            <p className="section-label" style={{ opacity: 0, animation: 'fadeIn 0.8s 0.3s var(--ease-out-expo) forwards' }}>Get in Touch</p>
            <h1 className="contact-hero-title">
              <span className="clip-line clip-d1"><span>Let's Talk</span></span>
            </h1>
            <p className="contact-hero-sub" style={{ opacity: 0, animation: 'fadeIn 0.8s 0.5s var(--ease-out-expo) forwards' }}>
              Have a project in mind? Whether it's an art installation, brand activation,
              or creative technology challenge — we'd love to hear from you.
            </p>
          </div>
          <div className="contact-form-section reveal reveal-d2">
            <ContactForm />
          </div>
        </div>
      </div>
    </>
  )
}
