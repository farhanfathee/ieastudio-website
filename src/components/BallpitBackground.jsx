import Ballpit from './Ballpit'
import './BallpitBackground.css'

const isMobile = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)

export default function BallpitBackground() {
  return (
    <div className="ballpit-bg">
      <Ballpit
        count={isMobile ? 85 : 255}
        gravity={0.2}
        wallBounce={1}
        followCursor={false}
        colors={['#ffffff', '#ffffff', '#8f8f8f']}
      />
    </div>
  )
}
