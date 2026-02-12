import SplashCursor from './SplashCursor'

export default function SplashCursorBackground() {
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
      }}
    >
      <SplashCursor
        SIM_RESOLUTION={128}
        DYE_RESOLUTION={1440}
        DENSITY_DISSIPATION={4}
        VELOCITY_DISSIPATION={2.5}
        PRESSURE={0.1}
        CURL={3}
        SPLAT_RADIUS={0.4}
        SPLAT_FORCE={6500}
        COLOR_UPDATE_SPEED={5}
      />
    </div>
  )
}
