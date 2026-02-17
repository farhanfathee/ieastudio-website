import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

export default function Robot3D({ style }) {
  const mountRef = useRef(null)
  const isMobile = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)

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
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
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
    // Only add mouse listener (no touch — it conflicts with scroll)
    window.addEventListener('mousemove', onMove)

    // On mobile: disable pointer events so scrolling works through the canvas
    if (isTouchDevice) container.style.pointerEvents = 'none'

    /* ═══════════ GYROSCOPE (mobile only) ═══════════ */
    let gyroHandler = null
    if (isTouchDevice) {
      gyroHandler = (e) => {
        const gamma = e.gamma || 0
        const beta = e.beta || 0
        mouse.x = THREE.MathUtils.clamp(gamma / 30, -1, 1)
        mouse.y = THREE.MathUtils.clamp(-(beta - 45) / 30, -1, 1)
        hasMouse = true
      }
      // Auto-enable gyro: iOS 13+ needs requestPermission, Android works directly
      if (typeof DeviceOrientationEvent !== 'undefined' &&
          typeof DeviceOrientationEvent.requestPermission === 'function') {
        // iOS — request on first user tap anywhere
        const requestGyro = async () => {
          try {
            const perm = await DeviceOrientationEvent.requestPermission()
            if (perm === 'granted') {
              window.addEventListener('deviceorientation', gyroHandler)
            }
          } catch {}
          window.removeEventListener('touchend', requestGyro)
        }
        window.addEventListener('touchend', requestGyro, { once: true })
      } else {
        window.addEventListener('deviceorientation', gyroHandler)
      }
    }

    /* ═══════════ BUTTERFLY CURSOR (desktop only) ═══════════ */
    if (!isTouchDevice) container.style.cursor = 'none'

    let butterfly = null, bfStyle = null, bfAnimId = null, onMoveButterfly = null

    if (!isTouchDevice) {
      butterfly = document.createElement('div')
      butterfly.innerHTML = `
        <svg width="34" height="34" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"
             style="filter: drop-shadow(0 0 10px rgba(255,150,220,0.5));">
          <defs>
            <linearGradient id="wl1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#ff6ec7"/>
              <stop offset="50%" stop-color="#a855f7"/>
              <stop offset="100%" stop-color="#3b82f6"/>
            </linearGradient>
            <linearGradient id="wl2" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#f97316"/>
              <stop offset="50%" stop-color="#ef4444"/>
              <stop offset="100%" stop-color="#ec4899"/>
            </linearGradient>
            <linearGradient id="wr1" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#06b6d4"/>
              <stop offset="50%" stop-color="#8b5cf6"/>
              <stop offset="100%" stop-color="#ec4899"/>
            </linearGradient>
            <linearGradient id="wr2" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#facc15"/>
              <stop offset="50%" stop-color="#f97316"/>
              <stop offset="100%" stop-color="#ef4444"/>
            </linearGradient>
          </defs>
          <g class="bf-body">
            <ellipse cx="50" cy="50" rx="2.5" ry="16" fill="#1a1a2e"/>
            <circle cx="50" cy="32" r="3.5" fill="#2d2b55"/>
            <line x1="47" y1="28" x2="38" y2="12" stroke="#a855f7" stroke-width="1.2" stroke-linecap="round"/>
            <line x1="53" y1="28" x2="62" y2="12" stroke="#ec4899" stroke-width="1.2" stroke-linecap="round"/>
            <circle cx="37" cy="11" r="2.2" fill="#facc15"/>
            <circle cx="63" cy="11" r="2.2" fill="#facc15"/>
          </g>
          <g class="bf-wing-l" style="transform-origin:50px 45px;">
            <path d="M50 35 Q18 10 8 38 Q3 55 28 54 Q40 54 50 48Z" fill="url(#wl1)" fill-opacity="0.75" stroke="rgba(255,255,255,0.3)" stroke-width="0.6"/>
            <path d="M50 48 Q22 52 12 68 Q18 84 38 74 Q47 67 50 58Z" fill="url(#wl2)" fill-opacity="0.65" stroke="rgba(255,255,255,0.2)" stroke-width="0.5"/>
            <circle cx="25" cy="40" r="5" fill="rgba(255,255,255,0.15)"/>
            <circle cx="28" cy="65" r="3.5" fill="rgba(255,255,255,0.12)"/>
          </g>
          <g class="bf-wing-r" style="transform-origin:50px 45px;">
            <path d="M50 35 Q82 10 92 38 Q97 55 72 54 Q60 54 50 48Z" fill="url(#wr1)" fill-opacity="0.75" stroke="rgba(255,255,255,0.3)" stroke-width="0.6"/>
            <path d="M50 48 Q78 52 88 68 Q82 84 62 74 Q53 67 50 58Z" fill="url(#wr2)" fill-opacity="0.65" stroke="rgba(255,255,255,0.2)" stroke-width="0.5"/>
            <circle cx="75" cy="40" r="5" fill="rgba(255,255,255,0.15)"/>
            <circle cx="72" cy="65" r="3.5" fill="rgba(255,255,255,0.12)"/>
          </g>
        </svg>
      `
      butterfly.style.cssText = 'position:fixed;left:0;top:0;pointer-events:none;opacity:0;transition:opacity 0.4s;will-change:transform;'
      container.appendChild(butterfly)

      bfStyle = document.createElement('style')
      bfStyle.textContent = `
        .bf-wing-l { animation: bfFlapL 0.25s ease-in-out infinite alternate; }
        .bf-wing-r { animation: bfFlapR 0.25s ease-in-out infinite alternate; }
        @keyframes bfFlapL { 0% { transform: scaleX(1); } 100% { transform: scaleX(0.3) skewY(8deg); } }
        @keyframes bfFlapR { 0% { transform: scaleX(1); } 100% { transform: scaleX(0.3) skewY(-8deg); } }
      `
      document.head.appendChild(bfStyle)

      let bfX = 0, bfY = 0, bfTargetX = 0, bfTargetY = 0
      let bfPrevX = 0, bfPrevY = 0, bfTime = 0
      const updateButterfly = () => {
        bfAnimId = requestAnimationFrame(updateButterfly)
        bfTime += 0.016

        const wobbleX = Math.sin(bfTime * 2.3) * 6 + Math.sin(bfTime * 5.1) * 3
        const wobbleY = Math.sin(bfTime * 1.8) * 8 + Math.cos(bfTime * 3.7) * 4

        const dx = (bfTargetX + wobbleX) - bfX
        const dy = (bfTargetY + wobbleY) - bfY
        const dist = Math.sqrt(dx * dx + dy * dy)
        const ease = Math.min(0.08 + dist * 0.0004, 0.18)
        bfX += dx * ease
        bfY += dy * ease

        const velX = bfX - bfPrevX
        const velY = bfY - bfPrevY
        const tilt = Math.atan2(velY, velX) * (180 / Math.PI) + 90
        const bankAngle = velX * -1.5

        butterfly.style.transform = `translate(${bfX - 16}px, ${bfY - 16}px) rotate(${tilt * 0.15 + bankAngle}deg) scale(${1 + Math.sin(bfTime * 3) * 0.05})`

        bfPrevX = bfX
        bfPrevY = bfY
      }
      updateButterfly()

      onMoveButterfly = (e) => {
        bfTargetX = e.clientX
        bfTargetY = e.clientY
        butterfly.style.opacity = '1'
      }
      window.addEventListener('mousemove', onMoveButterfly)
    }

    /* ═══════════ TRENDY MATERIALS ═══════════ */
    // Body — matching Kinect silver aluminum
    const matBody = new THREE.MeshPhysicalMaterial({
      color: 0xd8dade,
      metalness: 0.55,
      roughness: 0.2,
      clearcoat: 0.5,
      clearcoatRoughness: 0.1,
      envMapIntensity: 1.0,
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

    /* ═══════════ AZURE KINECT MATERIALS ═══════════ */
    // Silver body — clean aluminum
    const matAzureBody = new THREE.MeshPhysicalMaterial({
      color: 0xd8dade,
      metalness: 0.6,
      roughness: 0.18,
      clearcoat: 0.5,
      clearcoatRoughness: 0.1,
      envMapIntensity: 1.2,
    })
    // Dark sensor face — matte black
    const matAzureDark = new THREE.MeshPhysicalMaterial({
      color: 0x111115,
      metalness: 0.3,
      roughness: 0.6,
      clearcoat: 0.2,
      clearcoatRoughness: 0.3,
      envMapIntensity: 0.4,
    })
    // Blue glass lens
    const matAzureGlass = new THREE.MeshPhysicalMaterial({
      color: 0x3355aa,
      metalness: 0.1,
      roughness: 0.05,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      transmission: 0.3,
      thickness: 0.5,
      envMapIntensity: 1.5,
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

      // Hide original head meshes (all mesh descendants of Head bone)
      if (headBone) {
        headBone.traverse((child) => {
          if (child.isMesh) child.visible = false
        })
      }

      // Build universal joint neck connector
      if (neckBone) {
        const neckGroup = new THREE.Group()

        // Bottom ball joint (sits on body)
        const ballBottom = new THREE.Mesh(
          new THREE.SphereGeometry(0.0025, 16, 16),
          matJoints
        )
        ballBottom.position.set(0, 0.001, 0)
        ballBottom.castShadow = true
        neckGroup.add(ballBottom)

        // Main rod
        const rod = new THREE.Mesh(
          new THREE.CylinderGeometry(0.0012, 0.0012, 0.005, 12),
          matAccent
        )
        rod.position.set(0, 0.004, 0)
        rod.castShadow = true
        neckGroup.add(rod)

        // Middle ring (decorative joint ring)
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(0.002, 0.0006, 8, 16),
          matJoints
        )
        ring.position.set(0, 0.004, 0)
        ring.rotation.x = Math.PI / 2
        ring.castShadow = true
        neckGroup.add(ring)

        // Top ball joint (connects to Kinect head)
        const ballTop = new THREE.Mesh(
          new THREE.SphereGeometry(0.002, 16, 16),
          matJoints
        )
        ballTop.position.set(0, 0.007, 0)
        ballTop.castShadow = true
        neckGroup.add(ballTop)

        neckBone.add(neckGroup)
      }

      // Load Azure Kinect as replacement head
      loader.load('/models/Azure.glb', (azureGltf) => {
        const azure = azureGltf.scene

        azure.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true
            child.receiveShadow = true
            const matName = child.material?.name || ''
            if (matName === 'black' || matName === 'Material.001') {
              child.material = matAzureDark
            } else if (matName === 'sklo2' || matName === 'glass') {
              child.material = matAzureGlass
            } else {
              child.material = matAzureBody
            }
          }
        })

        if (headBone) {
          headBone.add(azure)
          azure.scale.setScalar(0.075)
          azure.position.set(0, 0.005, 0)
          azure.rotation.set(0, 0, 0)
        }
      })

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
    let gestureInProgress = false
    const fadeToAction = (name, duration = 0.3) => {
      if (gestureInProgress) return // don't interrupt gesture
      const newAction = actions[name]
      if (!newAction || newAction === activeAction) return
      if (activeAction) activeAction.fadeOut(duration)
      newAction.reset().fadeIn(duration).play()
      activeAction = newAction
    }

    // ThumbsUp gesture on form submit
    const onThumbsUp = () => {
      if (!actions['ThumbsUp'] || gestureInProgress) return
      gestureInProgress = true
      const gesture = actions['ThumbsUp']
      gesture.reset()
      gesture.setLoop(THREE.LoopOnce)
      gesture.clampWhenFinished = true
      if (activeAction) activeAction.fadeOut(0.3)
      gesture.fadeIn(0.3).play()
      activeAction = gesture

      // Return to idle after gesture finishes
      const onFinished = (e) => {
        if (e.action === gesture) {
          mixer.removeEventListener('finished', onFinished)
          gestureInProgress = false
          gesture.fadeOut(0.4)
          if (actions['Idle']) {
            activeAction = actions['Idle']
            activeAction.reset().fadeIn(0.4).play()
          }
        }
      }
      mixer.addEventListener('finished', onFinished)
    }
    window.addEventListener('robot-thumbsup', onThumbsUp)

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
      window.removeEventListener('resize', onResize)
      window.removeEventListener('robot-thumbsup', onThumbsUp)
      if (onMoveButterfly) window.removeEventListener('mousemove', onMoveButterfly)
      if (bfAnimId) cancelAnimationFrame(bfAnimId)
      if (butterfly && container.contains(butterfly)) container.removeChild(butterfly)
      if (bfStyle && bfStyle.parentNode) bfStyle.parentNode.removeChild(bfStyle)
      if (gyroHandler) window.removeEventListener('deviceorientation', gyroHandler)
      renderer.dispose()
      envMap.dispose()
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, pointerEvents: isMobile ? 'none' : 'auto', ...style }} />
}
