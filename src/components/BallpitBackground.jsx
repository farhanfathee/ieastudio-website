import Ballpit from './Ballpit'
import './BallpitBackground.css'

export default function BallpitBackground() {
  return (
    <div className="ballpit-bg">
      <Ballpit
        count={85}
        gravity={0.2}
        wallBounce={1}
        followCursor={false}
        colors={['#ffffff', '#ffffff', '#8f8f8f']}
      />
    </div>
  )
}
