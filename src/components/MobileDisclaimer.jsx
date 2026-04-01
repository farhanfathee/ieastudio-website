import './MobileDisclaimer.css'

export default function MobileDisclaimer({ onContinue }) {
  return (
    <div className="mobile-disclaimer">
      <div className="mobile-disclaimer-content">
        <div className="mobile-disclaimer-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
        </div>
        <p className="mobile-disclaimer-text">
          Best viewed on a PC or laptop browser.
        </p>
        <button className="btn-pill mobile-disclaimer-btn" onClick={onContinue}>
          <span>Continue Anyway</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}
