import { useState } from 'react'
import './Contact.css'

function ContactForm() {
  const [status, setStatus] = useState('idle') // idle | sending | success | error

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('sending')
    const formData = new FormData(e.target)
    const json = JSON.stringify(Object.fromEntries(formData))
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: json,
      })
      if (res.status === 200) {
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
    <form className="contact-form-wrapper" onSubmit={handleSubmit}>
      <input type="hidden" name="access_key" value="YOUR_ACCESS_KEY_HERE" />

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
        className="contact-submit-btn"
        disabled={status === 'sending'}
        style={{
          opacity: status === 'sending' ? 0.6 : 1,
          borderColor: status === 'success' ? '#22c55e' : status === 'error' ? '#ef4444' : undefined,
        }}
      >
        <span>
          {status === 'idle' && 'Send Inquiry'}
          {status === 'sending' && 'Sending...'}
          {status === 'success' && 'Submitted!'}
          {status === 'error' && 'Error — Try Again'}
        </span>
        {status === 'idle' && (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        )}
      </button>
    </form>
  )
}

export default function Contact() {
  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: '#000' }}>
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
          <div className="contact-left">
            <h1 className="contact-hero-title">Let's Talk</h1>
            <p className="contact-hero-sub">Have a project in mind? Whether it's an art installation, brand activation, or creative technology challenge, we'd love to hear from you.</p>
          </div>
          <div style={{ pointerEvents: 'auto' }}>
            <ContactForm />
          </div>
        </div>
      </div>
    </>
  )
}
