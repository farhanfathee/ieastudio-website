import { useEffect, useRef } from 'react'
import {
  AmbientLight,
  BoxGeometry,
  InstancedBufferAttribute,
  InstancedMesh,
  MathUtils,
  MeshBasicMaterial,
  Object3D,
  PerspectiveCamera,
  Plane,
  PointLight,
  Raycaster,
  Scene,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'

const { randFloat: rnd, randFloatSpread: rndFS } = MathUtils

export default function ParticleWhirlpool({ particleCount = 2000, blur = 0, children }) {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const instances = []
    for (let i = 0; i < particleCount; i++) {
      instances.push({
        position: new Vector3(rndFS(200), rndFS(200), rndFS(200)),
        scale: rnd(0.2, 1),
        scaleZ: rnd(0.1, 1),
        velocity: new Vector3(rndFS(2), rndFS(2), rndFS(2)),
        attraction: 0.03 + rnd(-0.01, 0.01),
        vLimit: 1.2 + rnd(-0.1, 0.1),
      })
    }

    const target = new Vector3()
    const dummyO = new Object3D()
    const dummyV = new Vector3()
    const pointer = new Vector2()
    const light = new PointLight(0x0060ff, 0.5)
    const raycaster = new Raycaster()

    const width = window.innerWidth
    const height = window.innerHeight

    const renderer = new WebGLRenderer({ canvas, antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.autoClear = false

    const camera = new PerspectiveCamera()
    camera.aspect = width / height
    camera.position.set(0, 0, 200)
    camera.updateProjectionMatrix()

    const scene = new Scene()
    scene.add(new AmbientLight(0x808080))
    const pl1 = new PointLight(0xff6000); scene.add(pl1)
    scene.add(light)
    const pl2 = new PointLight(0xff6000, 0.5); pl2.position.set(100, 0, 0); scene.add(pl2)
    const pl3 = new PointLight(0x0000ff, 0.5); pl3.position.set(-100, 0, 0); scene.add(pl3)

    const imesh = new InstancedMesh(
      new BoxGeometry(2, 2, 10),
      new MeshBasicMaterial({ transparent: true, opacity: 0.9 }),
      particleCount
    )
    scene.add(imesh)

    const controls = new OrbitControls(camera, renderer.domElement)

    const effectComposer = new EffectComposer(renderer)
    effectComposer.setSize(width, height)
    effectComposer.addPass(new RenderPass(scene, camera))
    effectComposer.addPass(new UnrealBloomPass(new Vector2(width, height), 0.94, 0, 0))

    // init
    for (let i = 0; i < particleCount; i++) {
      const { position, scale, scaleZ } = instances[i]
      dummyO.position.copy(position)
      dummyO.scale.set(scale, scale, scaleZ)
      dummyO.updateMatrix()
      imesh.setMatrixAt(i, dummyO.matrix)
    }
    const colors = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      colors[i * 3] = rnd(0, 1)
      colors[i * 3 + 1] = rnd(0, 1)
      colors[i * 3 + 2] = rnd(0, 1)
    }
    imesh.instanceColor = new InstancedBufferAttribute(colors, 3)
    imesh.instanceMatrix.needsUpdate = true

    let animId
    function animate() {
      animId = requestAnimationFrame(animate)
      controls.update()
      light.position.copy(target)
      for (let i = 0; i < particleCount; i++) {
        const { position, scale, scaleZ, velocity, attraction, vLimit } = instances[i]
        dummyV.copy(target).sub(position).normalize().multiplyScalar(attraction)
        velocity.add(dummyV).clampScalar(-vLimit, vLimit)
        position.add(velocity)
        dummyO.position.copy(position)
        dummyO.scale.set(scale, scale, scaleZ)
        dummyO.lookAt(dummyV.copy(position).add(velocity))
        dummyO.updateMatrix()
        imesh.setMatrixAt(i, dummyO.matrix)
      }
      imesh.instanceMatrix.needsUpdate = true
      effectComposer.render()
    }
    animate()

    function onPointerMove(event) {
      let clientX, clientY
      if (event.touches) {
        clientX = event.touches[0].clientX
        clientY = event.touches[0].clientY
      } else {
        clientX = event.clientX
        clientY = event.clientY
      }
      pointer.x = (clientX / window.innerWidth) * 2 - 1
      pointer.y = -(clientY / window.innerHeight) * 2 + 1
      raycaster.setFromCamera(pointer, camera)
      const planeZ = new Plane(new Vector3(0, 0, 1), 0)
      const point = new Vector3()
      raycaster.ray.intersectPlane(planeZ, point)
      target.copy(point)
    }

    function onResize() {
      const w = window.innerWidth
      const h = window.innerHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      effectComposer.setSize(w, h)
    }

    window.addEventListener('mousemove', onPointerMove)
    window.addEventListener('touchmove', onPointerMove)
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('mousemove', onPointerMove)
      window.removeEventListener('touchmove', onPointerMove)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
    }
  }, [particleCount])

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      {blur > 0 && (
        <div style={{
          position: 'absolute', inset: 0,
          backdropFilter: `blur(${blur}px)`,
          pointerEvents: 'none',
        }} />
      )}
      {children && (
        <div style={{ position: 'absolute', inset: 0 }}>
          {children}
        </div>
      )}
    </div>
  )
}
