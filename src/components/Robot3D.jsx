import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

export default function Robot3D({ style }) {
  const mountRef = useRef(null)

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    /* ═══════════ SCENE ═══════════ */
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x050505)

    const w = container.clientWidth || window.innerWidth
    const h = container.clientHeight || window.innerHeight
    const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 100)
    camera.position.set(0, 1.6, 6.5)
    camera.lookAt(0, 0.6, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.4
    container.appendChild(renderer.domElement)

    /* ═══════════ ENVIRONMENT MAP (for reflections) ═══════════ */
    const pmrem = new THREE.PMREMGenerator(renderer)
    const envScene = new THREE.Scene()
    envScene.background = new THREE.Color(0x111115)
    // Soft gradient hemisphere for subtle reflections
    const envLight1 = new THREE.DirectionalLight(0x8899cc, 1)
    envLight1.position.set(0, 5, 0)
    envScene.add(envLight1)
    const envLight2 = new THREE.DirectionalLight(0x334455, 0.5)
    envLight2.position.set(0, -3, 0)
    envScene.add(envLight2)
    const envMap = pmrem.fromScene(envScene, 0.04).texture
    scene.environment = envMap
    envScene.traverse(c => { if (c.dispose) c.dispose() })
    pmrem.dispose()

    /* ═══════════ LIGHTS ═══════════ */
    scene.add(new THREE.AmbientLight(0xffffff, 0.6))

    const key = new THREE.DirectionalLight(0xffffff, 1.8)
    key.position.set(3, 6, 5)
    key.castShadow = true
    key.shadow.mapSize.set(1024, 1024)
    key.shadow.camera.near = 0.5
    key.shadow.camera.far = 20
    key.shadow.camera.left = -5
    key.shadow.camera.right = 5
    key.shadow.camera.top = 5
    key.shadow.camera.bottom = -5
    key.shadow.radius = 4
    scene.add(key)

    const fill = new THREE.DirectionalLight(0xaabbff, 0.35)
    fill.position.set(-3, 4, -3)
    scene.add(fill)

    const rim = new THREE.DirectionalLight(0xffffff, 0.3)
    rim.position.set(0, 3, -5)
    scene.add(rim)

    /* ═══════════ GROUND ═══════════ */
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 30),
      new THREE.MeshStandardMaterial({ color: 0x0a0a0a, metalness: 0.7, roughness: 0.45, transparent: true, opacity: 0.6 })
    )
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    scene.add(ground)


    /* ═══════════ SCREEN BOUNDS ═══════════ */
    // Calculate visible X range at z=0 so robot stays on screen
    const getVisibleHalfWidth = () => {
      const vFov = THREE.MathUtils.degToRad(camera.fov)
      const dist = camera.position.z // distance to z=0
      const visH = 2 * Math.tan(vFov / 2) * dist
      const visW = visH * camera.aspect
      return visW / 2 * 0.85 // 85% margin so robot doesn't clip edges
    }
    let screenHalfW = getVisibleHalfWidth()

    /* ═══════════ INPUT ═══════════ */
    const mouse = new THREE.Vector2(0, 0)
    const cursorWorld = new THREE.Vector3(0, 0, 0)
    const gPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
    const rc = new THREE.Raycaster()
    let hasMouse = false

    const onMove = (e) => {
      const r = container.getBoundingClientRect()
      mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1
      mouse.y = -((e.clientY - r.top) / r.height) * 2 + 1
      hasMouse = true
    }
    const onTouch = (e) => {
      if (!e.touches.length) return
      const r = container.getBoundingClientRect()
      mouse.x = ((e.touches[0].clientX - r.left) / r.width) * 2 - 1
      mouse.y = -((e.touches[0].clientY - r.top) / r.height) * 2 + 1
      hasMouse = true
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('touchmove', onTouch, { passive: true })

    /* ═══════════ TRENDY MATERIALS ═══════════ */
    // Modern matte ceramic body — soft white with subtle blue undertone
    const matBody = new THREE.MeshPhysicalMaterial({
      color: 0xe8eaef,
      metalness: 0.05,
      roughness: 0.35,
      clearcoat: 0.4,
      clearcoatRoughness: 0.25,
      envMapIntensity: 0.6,
    })
    // Gunmetal joints — dark with subtle metallic sheen
    const matJoints = new THREE.MeshPhysicalMaterial({
      color: 0x2a2d35,
      metalness: 0.7,
      roughness: 0.25,
      clearcoat: 0.3,
      clearcoatRoughness: 0.15,
      envMapIntensity: 0.8,
    })
    // Accent panels — soft titanium gray with pearlescent finish
    const matAccent = new THREE.MeshPhysicalMaterial({
      color: 0x9aa3b0,
      metalness: 0.45,
      roughness: 0.2,
      clearcoat: 0.6,
      clearcoatRoughness: 0.1,
      envMapIntensity: 1.0,
    })

    /* ═══════════ LOAD MODEL ═══════════ */
    let mixer = null
    let actions = {}
    let activeAction = null
    let headBone = null
    let neckBone = null
    let model = null
    // Smoothed head target values
    let smoothHeadYaw = 0, smoothHeadPitch = 0

    const clock = new THREE.Clock()
    let animId = null
    let targetX = 0
    let currentFacing = 1
    let speed = 0

    const loader = new GLTFLoader()
    loader.load('/models/RobotExpressive.glb', (gltf) => {
      model = gltf.scene
      model.position.set(0, 0, 0)
      model.scale.setScalar(0.46) // 20% bigger

      // Apply trendy materials based on original material name
      model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true
          child.receiveShadow = true

          const origName = child.material?.name || ''

          if (origName === 'Black' || child.name.includes('Eye') || child.name.includes('Head_4')) {
            // Dark sensor/eye parts — gunmetal
            child.material = matJoints
          } else if (origName === 'Grey') {
            // Accent trim — titanium pearlescent
            child.material = matAccent
          } else {
            // Main body — ceramic white
            child.material = matBody
          }
        }
        // Find head and neck bones (not the mesh named Head)
        if ((child.isBone || child.isObject3D) && !child.isMesh) {
          if (child.name === 'Head') headBone = child
          if (child.name === 'Neck') neckBone = child
        }
      })

      scene.add(model)

      // Setup animations — remove Head and Neck tracks so cursor controls them
      mixer = new THREE.AnimationMixer(model)
      gltf.animations.forEach((clip) => {
        clip.tracks = clip.tracks.filter((track) => {
          const boneName = track.name.split('.')[0]
          return boneName !== 'Head' && boneName !== 'Neck'
        })
        actions[clip.name] = mixer.clipAction(clip)
      })

      // Start with Idle
      if (actions['Idle']) {
        activeAction = actions['Idle']
        activeAction.play()
      }
    })

    // Crossfade between animations
    const fadeToAction = (name, duration = 0.3) => {
      const newAction = actions[name]
      if (!newAction || newAction === activeAction) return
      if (activeAction) activeAction.fadeOut(duration)
      newAction.reset().fadeIn(duration).play()
      activeAction = newAction
    }

    /* ═══════════ ANIMATION LOOP ═══════════ */
    const animate = () => {
      animId = requestAnimationFrame(animate)
      const dt = Math.min(clock.getDelta(), 0.05)

      // Map cursor screen X directly to world X (works everywhere on screen)
      if (hasMouse) {
        targetX = THREE.MathUtils.clamp(mouse.x * screenHalfW, -screenHalfW, screenHalfW)
        // Also raycast for head tracking Y target
        rc.setFromCamera(mouse, camera)
        const hit = new THREE.Vector3()
        if (rc.ray.intersectPlane(gPlane, hit)) {
          cursorWorld.copy(hit)
        } else {
          // Fallback: project cursor onto a plane in front of the robot
          cursorWorld.set(targetX, 0.5 + mouse.y * 1.5, 0)
        }
      }

      if (model) {
        const dx = targetX - model.position.x
        const absDx = Math.abs(dx)

        // Smooth speed
        const tgtSpeed = absDx > 0.15 ? Math.min(absDx * 2, 3) : 0
        speed = THREE.MathUtils.lerp(speed, tgtSpeed, dt * 8)

        if (speed > 0.05) {
          // Move left/right, clamp to screen
          model.position.x += Math.sign(dx) * speed * dt
          model.position.x = THREE.MathUtils.clamp(model.position.x, -screenHalfW, screenHalfW)

          // Face movement direction
          const newFacing = dx > 0 ? 1 : -1
          if (newFacing !== currentFacing) currentFacing = newFacing

          // Walking or Running
          if (speed > 2) {
            fadeToAction('Running')
          } else {
            fadeToAction('Walking')
          }
        } else {
          fadeToAction('Idle')
        }

        // Rotation: face movement direction while walking, face front when idle
        const tgtRotY = speed > 0.05
          ? (currentFacing > 0 ? Math.PI / 2 : -Math.PI / 2)
          : 0  // face camera when stopped
        model.rotation.y = THREE.MathUtils.lerp(model.rotation.y, tgtRotY, dt * 6)

      }

      // Update animations FIRST
      if (mixer) mixer.update(dt)
      // Force world matrix update so bone positions are fresh
      if (model) model.updateMatrixWorld(true)

      // Head + neck tracking AFTER mixer so it overrides animation
      if (model && headBone && hasMouse) {
        // Use raw mouse position for reliable head tracking
        // mouse.x: -1 (left) to 1 (right), mouse.y: -1 (bottom) to 1 (top)

        // Yaw: map mouse X to head turn, account for model's facing direction
        const modelFacingFront = Math.abs(model.rotation.y) < 0.3
        let headYaw, headPitch

        if (modelFacingFront) {
          // Facing camera — turn head left/right based on mouse X
          headYaw = -mouse.x * 0.7
          headPitch = -mouse.y * 0.4
        } else {
          // Facing sideways — use cursor world position relative to head
          const headWp = new THREE.Vector3()
          headBone.getWorldPosition(headWp)
          const dx = cursorWorld.x - headWp.x
          const dy = cursorWorld.y - headWp.y
          const dz = cursorWorld.z - headWp.z
          const hDist = Math.max(Math.sqrt(dx * dx + dz * dz), 0.1)
          headYaw = THREE.MathUtils.clamp(-(Math.atan2(dx, dz) - model.rotation.y), -1.0, 1.0)
          headPitch = THREE.MathUtils.clamp(-Math.atan2(dy, hDist), -0.5, 0.6)
        }

        const clampedYaw = THREE.MathUtils.clamp(headYaw, -1.0, 1.0)
        const clampedPitch = THREE.MathUtils.clamp(headPitch, -0.5, 0.6)

        // Double-smooth: first smooth the target, then smooth the bone
        const smoothFactor = 1 - Math.pow(0.001, dt) // frame-rate independent smoothing ~0.93
        smoothHeadYaw += (clampedYaw - smoothHeadYaw) * smoothFactor
        smoothHeadPitch += (clampedPitch - smoothHeadPitch) * smoothFactor

        // Apply smoothed values to head bone
        const hLerp = 1 - Math.pow(0.01, dt)
        headBone.rotation.x = THREE.MathUtils.lerp(headBone.rotation.x, smoothHeadPitch, hLerp)
        headBone.rotation.y = THREE.MathUtils.lerp(headBone.rotation.y, smoothHeadYaw, hLerp)
        headBone.rotation.z = THREE.MathUtils.lerp(headBone.rotation.z, smoothHeadYaw * -0.1, hLerp)

        // Neck follows with slower smoothing for natural lag
        if (neckBone) {
          const nLerp = 1 - Math.pow(0.05, dt)
          neckBone.rotation.x = THREE.MathUtils.lerp(neckBone.rotation.x, smoothHeadPitch * 0.3, nLerp)
          neckBone.rotation.y = THREE.MathUtils.lerp(neckBone.rotation.y, smoothHeadYaw * 0.35, nLerp)
        }
      }

      renderer.render(scene, camera)
    }
    animate()

    /* ═══════════ RESIZE ═══════════ */
    const onResize = () => {
      const rw = container.clientWidth || window.innerWidth
      const rh = container.clientHeight || window.innerHeight
      camera.aspect = rw / rh
      camera.updateProjectionMatrix()
      renderer.setSize(rw, rh)
      screenHalfW = getVisibleHalfWidth() // recalculate bounds
    }
    window.addEventListener('resize', onResize)

    return () => {
      if (animId) cancelAnimationFrame(animId)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('touchmove', onTouch)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      envMap.dispose()
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, pointerEvents: 'auto', ...style }} />
}
