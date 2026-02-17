import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function Robot3D({ style }) {
  const mountRef = useRef(null)

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    /* ── Scene setup ── */
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    )
    camera.position.set(0, 2.8, 7)
    camera.lookAt(0, 1.2, 0)

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    container.appendChild(renderer.domElement)

    /* ── Lighting ── */
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2)
    dirLight.position.set(5, 10, 7)
    dirLight.castShadow = true
    dirLight.shadow.mapSize.set(1024, 1024)
    dirLight.shadow.camera.near = 0.5
    dirLight.shadow.camera.far = 30
    dirLight.shadow.camera.left = -10
    dirLight.shadow.camera.right = 10
    dirLight.shadow.camera.top = 10
    dirLight.shadow.camera.bottom = -10
    dirLight.shadow.radius = 4
    scene.add(dirLight)

    const fillLight = new THREE.DirectionalLight(0x8888ff, 0.3)
    fillLight.position.set(-3, 5, -5)
    scene.add(fillLight)

    // Cyan glow light that follows the robot
    const eyeGlow = new THREE.PointLight(0x00e5ff, 2, 6, 2)
    scene.add(eyeGlow)

    // Ground glow
    const groundGlow = new THREE.PointLight(0x00e5ff, 0.5, 4, 2)
    scene.add(groundGlow)

    /* ── Materials ── */
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xeaeaea,
      metalness: 0.15,
      roughness: 0.35,
    })
    const bodyMatDark = new THREE.MeshStandardMaterial({
      color: 0xc8c8c8,
      metalness: 0.2,
      roughness: 0.4,
    })
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x3a3a3a,
      metalness: 0.6,
      roughness: 0.25,
    })
    const jointMat = new THREE.MeshStandardMaterial({
      color: 0x555555,
      metalness: 0.7,
      roughness: 0.2,
    })
    const accentMat = new THREE.MeshStandardMaterial({
      color: 0xdaa520,
      metalness: 0.7,
      roughness: 0.2,
    })
    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0x00e5ff,
      emissive: 0x00e5ff,
      emissiveIntensity: 3,
      metalness: 0.1,
      roughness: 0.1,
    })
    const screenMat = new THREE.MeshStandardMaterial({
      color: 0x111822,
      metalness: 0.1,
      roughness: 0.6,
    })

    /* ── Build Robot ── */
    const robot = new THREE.Group()

    // === BODY (rounded sphere torso) ===
    const bodyGroup = new THREE.Group()
    const bodySphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.55, 32, 32),
      bodyMat
    )
    bodySphere.scale.set(1, 0.9, 0.85)
    bodySphere.castShadow = true
    bodyGroup.add(bodySphere)

    // Body panel lines
    const panelRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.48, 0.015, 8, 32),
      frameMat
    )
    panelRing.rotation.x = Math.PI / 2
    panelRing.position.y = 0.05
    bodyGroup.add(panelRing)

    // Small accent dots on body
    for (let i = 0; i < 3; i++) {
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.025, 8, 8),
        i === 1 ? accentMat : frameMat
      )
      dot.position.set(-0.12 + i * 0.12, 0.25, 0.48)
      bodyGroup.add(dot)
    }

    bodyGroup.position.y = 1.4
    robot.add(bodyGroup)

    // === NECK ===
    const neck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.12, 0.18, 16),
      frameMat
    )
    neck.position.y = 1.95
    neck.castShadow = true
    robot.add(neck)

    // === HEAD ===
    const headGroup = new THREE.Group()

    // Main head box
    const headGeo = new THREE.BoxGeometry(0.85, 0.55, 0.6, 4, 4, 4)
    // Round the edges slightly
    const posAttr = headGeo.getAttribute('position')
    const v = new THREE.Vector3()
    for (let i = 0; i < posAttr.count; i++) {
      v.fromBufferAttribute(posAttr, i)
      const fx = Math.pow(Math.abs(v.x) / 0.425, 6)
      const fy = Math.pow(Math.abs(v.y) / 0.275, 6)
      const fz = Math.pow(Math.abs(v.z) / 0.3, 6)
      const d = Math.pow(fx + fy + fz, 1 / 6)
      if (d > 1) {
        v.divideScalar(d)
        posAttr.setXYZ(i, v.x, v.y, v.z)
      }
    }
    headGeo.computeVertexNormals()
    const headMesh = new THREE.Mesh(headGeo, bodyMat)
    headMesh.castShadow = true
    headGroup.add(headMesh)

    // Face screen (dark inset)
    const screenGeo = new THREE.PlaneGeometry(0.65, 0.38)
    const screen = new THREE.Mesh(screenGeo, screenMat)
    screen.position.z = 0.301
    screen.position.y = -0.02
    headGroup.add(screen)

    // Eyes (glowing cyan circles)
    const eyeGeo = new THREE.CircleGeometry(0.1, 24)
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat)
    leftEye.position.set(-0.16, 0.0, 0.305)
    headGroup.add(leftEye)

    const rightEye = new THREE.Mesh(eyeGeo, eyeMat)
    rightEye.position.set(0.16, 0.0, 0.305)
    headGroup.add(rightEye)

    // Eye rings (outer glow border)
    const eyeRingGeo = new THREE.RingGeometry(0.1, 0.125, 24)
    const eyeRingMat = new THREE.MeshStandardMaterial({
      color: 0x00e5ff,
      emissive: 0x00e5ff,
      emissiveIntensity: 1.5,
      side: THREE.DoubleSide,
    })
    const leftEyeRing = new THREE.Mesh(eyeRingGeo, eyeRingMat)
    leftEyeRing.position.set(-0.16, 0.0, 0.303)
    headGroup.add(leftEyeRing)

    const rightEyeRing = new THREE.Mesh(eyeRingGeo, eyeRingMat)
    rightEyeRing.position.set(0.16, 0.0, 0.303)
    headGroup.add(rightEyeRing)

    // Top antenna nubs
    const antennaBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.05, 0.06, 8),
      frameMat
    )
    antennaBase.position.set(0, 0.3, 0)
    headGroup.add(antennaBase)

    const antennaPole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.02, 0.16, 8),
      frameMat
    )
    antennaPole.position.set(0, 0.42, 0)
    headGroup.add(antennaPole)

    const antennaTip = new THREE.Mesh(
      new THREE.SphereGeometry(0.035, 12, 12),
      eyeMat
    )
    antennaTip.position.set(0, 0.52, 0)
    headGroup.add(antennaTip)

    // Side ear-like protrusions
    for (const side of [-1, 1]) {
      const ear = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.16, 0.12),
        bodyMatDark
      )
      ear.position.set(side * 0.46, 0.0, 0)
      headGroup.add(ear)
    }

    headGroup.position.y = 2.32
    robot.add(headGroup)

    // === LEGS ===
    const createLeg = (xOffset) => {
      const legGroup = new THREE.Group()
      legGroup.position.set(xOffset, 0.85, 0)

      // Hip joint
      const hip = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 12, 12),
        jointMat
      )
      hip.castShadow = true
      legGroup.add(hip)

      // Upper leg
      const upperLeg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.055, 0.045, 0.4, 12),
        frameMat
      )
      upperLeg.position.y = -0.24
      upperLeg.castShadow = true
      legGroup.add(upperLeg)

      // Accent wire on upper leg
      const wire = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.012, 0.35, 6),
        accentMat
      )
      wire.position.set(0.06, -0.22, 0)
      legGroup.add(wire)

      // Knee joint
      const knee = new THREE.Mesh(
        new THREE.SphereGeometry(0.07, 12, 12),
        accentMat
      )
      knee.position.y = -0.45
      knee.castShadow = true
      legGroup.add(knee)

      // Lower leg group (pivots at knee)
      const lowerLegGroup = new THREE.Group()
      lowerLegGroup.position.y = -0.45

      const lowerLeg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.05, 0.38, 12),
        frameMat
      )
      lowerLeg.position.y = -0.22
      lowerLeg.castShadow = true
      lowerLegGroup.add(lowerLeg)

      // Foot
      const foot = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, 0.05, 0.22),
        jointMat
      )
      foot.position.set(0, -0.42, 0.03)
      foot.castShadow = true
      lowerLegGroup.add(foot)

      // Foot accent
      const footAccent = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.02, 0.18),
        bodyMatDark
      )
      footAccent.position.set(0, -0.39, 0.03)
      lowerLegGroup.add(footAccent)

      legGroup.add(lowerLegGroup)

      return { group: legGroup, lowerLegGroup }
    }

    const leftLeg = createLeg(-0.22)
    const rightLeg = createLeg(0.22)
    robot.add(leftLeg.group)
    robot.add(rightLeg.group)

    // === ARMS (small stubby) ===
    const createArm = (xOffset) => {
      const armGroup = new THREE.Group()
      armGroup.position.set(xOffset, 1.5, 0)

      // Shoulder joint
      const shoulder = new THREE.Mesh(
        new THREE.SphereGeometry(0.065, 12, 12),
        jointMat
      )
      armGroup.add(shoulder)

      // Upper arm
      const upperArm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.035, 0.28, 10),
        frameMat
      )
      upperArm.position.y = -0.16
      upperArm.castShadow = true
      armGroup.add(upperArm)

      // Hand (small sphere)
      const hand = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 10, 10),
        bodyMatDark
      )
      hand.position.y = -0.32
      hand.castShadow = true
      armGroup.add(hand)

      return { group: armGroup }
    }

    const leftArm = createArm(-0.62)
    const rightArm = createArm(0.62)
    robot.add(leftArm.group)
    robot.add(rightArm.group)

    scene.add(robot)

    // === GROUND (subtle reflective) ===
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 30),
      new THREE.MeshStandardMaterial({
        color: 0x080808,
        metalness: 0.8,
        roughness: 0.4,
        transparent: true,
        opacity: 0.6,
      })
    )
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    scene.add(ground)

    /* ── Mouse tracking ── */
    const mouse = new THREE.Vector2(0, 0)
    const targetPos = new THREE.Vector3(0, 0, 0)
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
    const raycaster = new THREE.Raycaster()
    let hasMouseInput = false

    const onMouseMove = (e) => {
      const rect = container.getBoundingClientRect()
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
      hasMouseInput = true
    }

    const onTouchMove = (e) => {
      if (e.touches.length > 0) {
        const rect = container.getBoundingClientRect()
        mouse.x = ((e.touches[0].clientX - rect.left) / rect.width) * 2 - 1
        mouse.y = -((e.touches[0].clientY - rect.top) / rect.height) * 2 + 1
        hasMouseInput = true
      }
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('touchmove', onTouchMove, { passive: true })

    /* ── Animation loop ── */
    const clock = new THREE.Clock()
    let walkPhase = 0
    let currentSpeed = 0
    let animId = null

    const animate = () => {
      animId = requestAnimationFrame(animate)
      const dt = Math.min(clock.getDelta(), 0.05)
      const time = clock.getElapsedTime()

      // Raycast mouse → ground plane
      if (hasMouseInput) {
        raycaster.setFromCamera(mouse, camera)
        const hit = new THREE.Vector3()
        if (raycaster.ray.intersectPlane(groundPlane, hit)) {
          // Clamp target within reasonable range
          hit.x = THREE.MathUtils.clamp(hit.x, -6, 6)
          hit.z = THREE.MathUtils.clamp(hit.z, -4, 6)
          targetPos.lerp(hit, 0.08)
        }
      }

      // Direction & distance to target
      const dx = targetPos.x - robot.position.x
      const dz = targetPos.z - robot.position.z
      const distance = Math.sqrt(dx * dx + dz * dz)

      const isMoving = distance > 0.3

      // Smooth speed ramp
      const targetSpeed = isMoving ? Math.min(distance * 1.5, 3.0) : 0
      currentSpeed = THREE.MathUtils.lerp(currentSpeed, targetSpeed, dt * 5)

      if (currentSpeed > 0.05) {
        // Move robot
        const moveAmt = currentSpeed * dt
        const nx = dx / distance
        const nz = dz / distance
        robot.position.x += nx * moveAmt
        robot.position.z += nz * moveAmt

        // Rotate to face direction (smooth)
        const targetAngle = Math.atan2(nx, nz)
        let angleDiff = targetAngle - robot.rotation.y
        // Normalize angle difference
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2
        robot.rotation.y += angleDiff * dt * 8

        // Walking animation
        walkPhase += dt * (6 + currentSpeed * 2)
        const legSwing = Math.sin(walkPhase) * 0.35
        const kneeSwing = Math.max(0, Math.sin(walkPhase)) * 0.3

        leftLeg.group.rotation.x = legSwing
        rightLeg.group.rotation.x = -legSwing
        leftLeg.lowerLegGroup.rotation.x = kneeSwing
        rightLeg.lowerLegGroup.rotation.x = Math.max(0, Math.sin(walkPhase + Math.PI)) * 0.3

        // Arm swing (opposite to legs)
        leftArm.group.rotation.x = -legSwing * 0.5
        rightArm.group.rotation.x = legSwing * 0.5

        // Body bob
        robot.position.y = Math.abs(Math.sin(walkPhase * 2)) * 0.04

        // Slight body tilt in direction of movement
        bodyGroup.rotation.x = THREE.MathUtils.lerp(bodyGroup.rotation.x, 0.08, dt * 3)
      } else {
        // Idle — gentle breathing animation
        leftLeg.group.rotation.x *= 1 - dt * 6
        rightLeg.group.rotation.x *= 1 - dt * 6
        leftLeg.lowerLegGroup.rotation.x *= 1 - dt * 6
        rightLeg.lowerLegGroup.rotation.x *= 1 - dt * 6
        leftArm.group.rotation.x *= 1 - dt * 6
        rightArm.group.rotation.x *= 1 - dt * 6

        robot.position.y = Math.sin(time * 1.5) * 0.025

        bodyGroup.rotation.x = THREE.MathUtils.lerp(bodyGroup.rotation.x, 0, dt * 3)

        // Look toward cursor when idle
        if (hasMouseInput) {
          const lookAngle = Math.atan2(dx, dz)
          let diff = lookAngle - robot.rotation.y
          while (diff > Math.PI) diff -= Math.PI * 2
          while (diff < -Math.PI) diff += Math.PI * 2
          robot.rotation.y += diff * dt * 3
        }

        // Idle head tilt
        headGroup.rotation.z = Math.sin(time * 0.8) * 0.05
        headGroup.rotation.x = Math.sin(time * 1.2) * 0.03
      }

      // Eye glow pulse
      const pulse = 2.5 + Math.sin(time * 4) * 0.8
      eyeMat.emissiveIntensity = pulse
      eyeRingMat.emissiveIntensity = pulse * 0.6

      // Antenna tip blink
      antennaTip.material.emissiveIntensity = 2 + Math.sin(time * 6) * 1.5

      // Update glow lights
      const worldPos = new THREE.Vector3()
      headGroup.getWorldPosition(worldPos)
      eyeGlow.position.set(worldPos.x, worldPos.y, worldPos.z + 0.8)
      eyeGlow.intensity = pulse * 0.6
      groundGlow.position.set(robot.position.x, 0.05, robot.position.z)

      renderer.render(scene, camera)
    }

    animate()

    /* ── Resize ── */
    const onResize = () => {
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    /* ── Cleanup ── */
    return () => {
      if (animId) cancelAnimationFrame(animId)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div
      ref={mountRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'auto',
        ...style,
      }}
    />
  )
}
