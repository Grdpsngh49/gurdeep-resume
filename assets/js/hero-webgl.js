(() => {
  const HERO_SELECTOR = "#hero-webgl";
  const HERO_SECTION_SELECTOR = ".hero";
  const THREE_CDN = "https://cdn.jsdelivr.net/npm/three@0.184.0/build/three.module.js";

  const container = document.querySelector(HERO_SELECTOR);
  const heroSection = document.querySelector(HERO_SECTION_SELECTOR);

  if (!container || !heroSection) {
    return;
  }

  const supportsWebGL = (() => {
    try {
      const canvas = document.createElement("canvas");
      return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
    } catch (error) {
      return false;
    }
  })();

  if (!supportsWebGL) {
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const createNodeMaterial = (THREE, color, intensity = 1.2) =>
    new THREE.MeshStandardMaterial({
      color: 0x08131d,
      emissive: color,
      emissiveIntensity: intensity,
      metalness: 0.2,
      roughness: 0.32,
    });

  const createHeroScene = async () => {
    const THREE = await import(THREE_CDN);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.setAttribute("aria-hidden", "true");

    container.append(renderer.domElement);
    document.body.classList.add("has-hero-webgl");

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x040a10, 0.1);

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0.7, 10.5);

    const root = new THREE.Group();
    scene.add(root);

    const particlesGroup = new THREE.Group();
    const ringGroup = new THREE.Group();
    const lineGroup = new THREE.Group();
    const nodeGroup = new THREE.Group();
    const packetGroup = new THREE.Group();
    root.add(particlesGroup, ringGroup, lineGroup, nodeGroup, packetGroup);

    const ambientLight = new THREE.AmbientLight(0x9ce8ff, 1.8);
    const keyLight = new THREE.PointLight(0x52e4d9, 18, 24, 2);
    keyLight.position.set(4.5, 3, 6);
    const warmLight = new THREE.PointLight(0xffb45c, 12, 20, 2);
    warmLight.position.set(-4, -2, 4);
    scene.add(ambientLight, keyLight, warmLight);

    const coreGeometry = new THREE.IcosahedronGeometry(0.7, 0);
    const coreMaterial = new THREE.MeshStandardMaterial({
      color: 0x07131b,
      emissive: 0x52e4d9,
      emissiveIntensity: 0.55,
      metalness: 0.38,
      roughness: 0.28,
      wireframe: true,
      transparent: true,
      opacity: 0.5,
    });
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    root.add(coreMesh);

    const haloGeometry = new THREE.TorusGeometry(1.08, 0.035, 10, 180);
    const haloMaterial = new THREE.MeshBasicMaterial({
      color: 0x52e4d9,
      transparent: true,
      opacity: 0.28,
    });
    const halo = new THREE.Mesh(haloGeometry, haloMaterial);
    halo.rotation.x = Math.PI / 2.5;
    root.add(halo);

    const ringConfigs = [
      { radius: 3.3, color: 0x52e4d9, opacity: 0.22, rotation: [1.1, 0.1, 0.25] },
      { radius: 4.4, color: 0xffb45c, opacity: 0.14, rotation: [0.4, 0.95, -0.2] },
      { radius: 2.4, color: 0x8cf8ff, opacity: 0.16, rotation: [0.15, -0.35, 1.0] },
    ];

    ringConfigs.forEach((config) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(config.radius, 0.024, 8, 240),
        new THREE.MeshBasicMaterial({
          color: config.color,
          transparent: true,
          opacity: config.opacity,
        })
      );
      ring.rotation.set(...config.rotation);
      ringGroup.add(ring);
    });

    const nodePositions = [
      new THREE.Vector3(-2.9, 1.2, 1.4),
      new THREE.Vector3(-1.6, -1.7, 2.6),
      new THREE.Vector3(0.2, 2.05, 1.15),
      new THREE.Vector3(2.4, 1.1, 2.8),
      new THREE.Vector3(3.05, -1.05, 0.8),
      new THREE.Vector3(1.4, -2.05, -2.15),
      new THREE.Vector3(-0.9, 0.25, -3.15),
      new THREE.Vector3(-3.2, -0.35, -1.4),
      new THREE.Vector3(0.7, 1.1, -1.1),
      new THREE.Vector3(2.45, 2.15, -0.95),
    ];

    const nodeGeometry = new THREE.IcosahedronGeometry(0.13, 1);
    const nodeHalos = [];
    nodePositions.forEach((position, index) => {
      const color = index % 3 === 0 ? 0xffb45c : 0x52e4d9;
      const node = new THREE.Mesh(nodeGeometry, createNodeMaterial(THREE, color, index % 3 === 0 ? 1.1 : 1.4));
      node.position.copy(position);
      node.userData.phase = index * 0.37;
      nodeGroup.add(node);

      const haloMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 10, 10),
        new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.12,
        })
      );
      haloMesh.position.copy(position);
      haloMesh.userData.phase = index * 0.41;
      nodeGroup.add(haloMesh);
      nodeHalos.push(haloMesh);
    });

    const connectionPairs = [
      [0, 2],
      [0, 7],
      [0, 8],
      [1, 5],
      [1, 7],
      [1, 8],
      [2, 3],
      [2, 8],
      [2, 9],
      [3, 4],
      [3, 8],
      [4, 5],
      [4, 9],
      [5, 6],
      [6, 7],
      [6, 8],
      [8, 9],
    ];

    const linePositions = [];
    connectionPairs.forEach(([a, b]) => {
      linePositions.push(...nodePositions[a].toArray(), ...nodePositions[b].toArray());
    });

    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(linePositions, 3)
    );

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x52e4d9,
      transparent: true,
      opacity: 0.22,
    });

    const lineSegments = new THREE.LineSegments(lineGeometry, lineMaterial);
    lineGroup.add(lineSegments);

    const particleCount = 360;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let index = 0; index < particleCount; index += 1) {
      const radius = 3.8 + Math.random() * 3.6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const offset = index * 3;

      particlePositions[offset] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[offset + 1] = radius * Math.cos(phi) * 0.6;
      particlePositions[offset + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3)
    );

    const particleMaterial = new THREE.PointsMaterial({
      color: 0x7ee9ff,
      size: 0.05,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particleField = new THREE.Points(particleGeometry, particleMaterial);
    particlesGroup.add(particleField);

    const packetCurves = [
      [0, 2],
      [2, 3],
      [3, 4],
      [6, 8],
      [1, 5],
      [7, 0],
    ].map(([startIndex, endIndex], curveIndex) => {
      const start = nodePositions[startIndex].clone();
      const end = nodePositions[endIndex].clone();
      const middle = start.clone().lerp(end, 0.5);
      middle.y += 0.55 + curveIndex * 0.08;
      middle.z += curveIndex % 2 === 0 ? 0.7 : -0.7;

      return new THREE.CatmullRomCurve3([start, middle, end]);
    });

    const packetGeometry = new THREE.SphereGeometry(0.06, 12, 12);
    const packets = packetCurves.map((curve, index) => {
      const packet = new THREE.Mesh(
        packetGeometry,
        new THREE.MeshBasicMaterial({
          color: index % 2 === 0 ? 0x52e4d9 : 0xffb45c,
          transparent: true,
          opacity: 0.95,
        })
      );

      packet.userData = {
        curve,
        offset: index / packetCurves.length,
        speed: 0.075 + index * 0.008,
      };

      packetGroup.add(packet);
      return packet;
    });

    const pointer = { x: 0, y: 0 };
    const targetRotation = { x: 0, y: 0 };
    let heroVisible = true;
    let rafId = 0;
    let resizeFrame = 0;
    let lastTime = 0;

    const resize = () => {
      resizeFrame = 0;
      const width = Math.max(container.clientWidth, 1);
      const height = Math.max(container.clientHeight, 1);

      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const scheduleResize = () => {
      if (!resizeFrame) {
        resizeFrame = window.requestAnimationFrame(resize);
      }
    };

    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(scheduleResize)
        : null;

    observer?.observe(container);

    const visibilityObserver =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(
            ([entry]) => {
              heroVisible = Boolean(entry?.isIntersecting);

              if (heroVisible && !rafId && !prefersReducedMotion && !document.hidden) {
                rafId = window.requestAnimationFrame(render);
              }
            },
            { threshold: 0.08 }
          )
        : null;

    visibilityObserver?.observe(heroSection);

    const handlePointerMove = (event) => {
      const bounds = heroSection.getBoundingClientRect();
      const relativeX = (event.clientX - bounds.left) / bounds.width;
      const relativeY = (event.clientY - bounds.top) / bounds.height;
      pointer.x = clamp(relativeX * 2 - 1, -1, 1);
      pointer.y = clamp(relativeY * 2 - 1, -1, 1);
    };

    const handlePointerLeave = () => {
      pointer.x = 0;
      pointer.y = 0;
    };

    heroSection.addEventListener("pointermove", handlePointerMove);
    heroSection.addEventListener("pointerleave", handlePointerLeave);
    window.addEventListener("resize", scheduleResize);

    const handleVisibilityChange = () => {
      if (!document.hidden && heroVisible && !rafId && !prefersReducedMotion) {
        rafId = window.requestAnimationFrame(render);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    const render = (timestamp) => {
      rafId = 0;

      if (!heroVisible || document.hidden) {
        return;
      }

      const elapsed = timestamp * 0.001;
      const delta = Math.min((timestamp - lastTime) * 0.001 || 0.016, 0.04);
      lastTime = timestamp;

      targetRotation.x += (pointer.y * 0.22 - targetRotation.x) * 0.06;
      targetRotation.y += (pointer.x * 0.35 - targetRotation.y) * 0.06;

      root.rotation.x = targetRotation.x;
      root.rotation.y = elapsed * 0.12 + targetRotation.y;

      ringGroup.children.forEach((ring, index) => {
        ring.rotation.x += delta * (0.06 + index * 0.012);
        ring.rotation.y -= delta * (0.08 + index * 0.01);
      });

      coreMesh.rotation.x += delta * 0.22;
      coreMesh.rotation.y -= delta * 0.18;
      halo.rotation.z += delta * 0.14;
      particlesGroup.rotation.y += delta * 0.025;

      nodeGroup.children.forEach((node) => {
        const phase = node.userData.phase || 0;
        const pulse = 1 + Math.sin(elapsed * 1.8 + phase) * 0.08;
        node.scale.setScalar(pulse);
      });

      packets.forEach((packet) => {
        const { curve, offset, speed } = packet.userData;
        const progress = (elapsed * speed + offset) % 1;
        packet.position.copy(curve.getPointAt(progress));
      });

      camera.position.x += ((pointer.x * 0.55) - camera.position.x) * 0.05;
      camera.position.y += ((-pointer.y * 0.35 + 0.7) - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
      rafId = window.requestAnimationFrame(render);
    };

    resize();

    if (prefersReducedMotion) {
      root.rotation.y = 0.55;
      root.rotation.x = -0.1;
      packets.forEach((packet, index) => {
        packet.position.copy(packet.userData.curve.getPointAt((index + 1) / 8));
      });
      renderer.render(scene, camera);
      return;
    }

    rafId = window.requestAnimationFrame(render);
  };

  createHeroScene().catch((error) => {
    console.error("Three.js hero scene could not be initialized.", error);
  });
})();
