import { useState } from 'react'
import useScrollReveal from '../hooks/useScrollReveal'
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
            <option value="1k-5k">$1,000 – $5,000</option>
            <option value="5k-10k">$5,000 – $10,000</option>
            <option value="10k+">$10,000+</option>
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
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: '#050505' }}>
        <iframe
          src="https://my.spline.design/3drobot-Jl6wJf8YKj20BkRIUic6iDex/"
          frameBorder="0"
          width="100%"
          height="100%"
          style={{ display: 'block', transform: 'translateX(15%) scale(1)', transformOrigin: 'center center' }}
        />
      </div>
      <div className="contact-page" style={{ position: 'relative', zIndex: 1, pointerEvents: 'none' }}>
        <div className="contact-inner">
          <div className="contact-hero reveal">
            <p className="section-label">Get in Touch</p>
            <h1 className="contact-hero-title">
              Let's Talk
            </h1>
            <p className="contact-hero-sub">
              Have a project in mind? Whether it's an art installation, brand activation,
              or creative technology challenge — we'd love to hear from you.
            </p>
          </div>
          <div className="contact-form-section reveal reveal-d2" style={{ pointerEvents: 'auto' }}>
            <ContactForm />
          </div>
        </div>
      </div>
    </>
  )
}
