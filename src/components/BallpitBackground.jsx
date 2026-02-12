import Ballpit from './Ballpit'

export default function BallpitBackground() {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        background: '#000000',
        pointerEvents: 'none',
      }}
    >
      <Ballpit
        count={170}
        gravity={0.2}
        wallBounce={1}
        followCursor={false}
        colors={['#ffffff', '#ffffff', '#8f8f8f']}
      />
    </div>
  )
}
