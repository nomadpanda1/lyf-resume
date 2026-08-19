import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

const canvas = document.getElementById('resume-graph');

if (canvas) {
  const stage = canvas.parentElement;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const compact = matchMedia('(max-width: 720px), (pointer: coarse)').matches;
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x02080c, compact ? 0.024 : 0.018);

  const camera = new THREE.PerspectiveCamera(43, 1, 0.1, 150);
  const overview = compact ? new THREE.Vector3(0, 8, 31) : new THREE.Vector3(0, 7, 29);
  camera.position.copy(overview);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !compact, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, compact ? 1.25 : 1.75));
  renderer.setClearColor(0x02080c, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  canvas.dataset.renderer = 'three-webgl';

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), compact ? 0.75 : 1.05, 0.65, 0.22);
  composer.addPass(bloom);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = !reducedMotion;
  controls.dampingFactor = 0.055;
  controls.enablePan = false;
  controls.minDistance = 11;
  controls.maxDistance = 43;
  controls.minPolarAngle = Math.PI * 0.16;
  controls.maxPolarAngle = Math.PI * 0.78;
  controls.autoRotate = !reducedMotion;
  controls.autoRotateSpeed = 0.22;

  const nodes = [
    { id: 'electrical', label: '电气控制', code: 'LAYER 01', kind: 'ENGINEERING DOMAIN', color: 0xffbc54, position: [-9.6, 1.5, 0.6], copy: '从电路、电机控制到储能调度，以系统约束和现场数据完成控制闭环。', tags: ['电气工程', '控制', '储能'] },
    { id: 'embedded', label: '嵌入式底层', code: 'LAYER 02', kind: 'HARDWARE STACK', color: 0x62f5ce, position: [-5.5, 5.6, -1.8], copy: 'STM32、ESP32、Arduino、寄存器级驱动与 PWM 实时控制。', tags: ['C/C++', 'STM32', 'PWM'] },
    { id: 'robotics', label: '机器人与感知', code: 'LAYER 03', kind: 'ROBOTICS SYSTEM', color: 0x59c7ff, position: [1.5, 7, -2.3], copy: 'ROS2 导航、YDLIDAR 标定、SLAM 建图与 YOLOX 工业视觉。', tags: ['ROS2', 'SLAM', 'YOLOX'] },
    { id: 'agents', label: 'Graph RAG / Agent', code: 'LAYER 04', kind: 'INTELLIGENCE STACK', color: 0xc290ff, position: [8.5, 3.1, -0.8], copy: 'Cyber-Secretary：长期图谱记忆、动态任务拆解与多智能体异步调度。', tags: ['Node.js', 'Graph RAG', 'Multi-Agent'] },
    { id: 'backend', label: '云原生服务', code: 'LAYER 05', kind: 'DEPLOYMENT STACK', color: 0xff6f7d, position: [8.6, -3.2, 1.2], copy: 'Docker、API、Caddy 与 Cloudflare Tunnel 组成可部署、可观测的服务链路。', tags: ['Docker', 'API', 'Caddy'] },
    { id: 'webgl', label: 'Three.js / WebGL', code: 'LAYER 06', kind: 'SIMULATION ENGINE', color: 0x59f0ff, position: [1.8, -6.8, -1.5], copy: '带电粒子动力学数值解算、Three.js 空间渲染与实时数据映射。', tags: ['Three.js', 'WebGL', 'ECharts'] },
    { id: 'microgrid', label: 'MicroGridSystem', code: 'LAYER 07', kind: 'ENERGY SYSTEM', color: 0xffd875, position: [-5.6, -5.2, 0.2], copy: 'C++ 动态仿真内核与 Python 策略调度，覆盖源-网-荷-储多工况。', tags: ['C++', 'Python', 'BMS'] },
  ];
  const links = [[0, 1], [0, 6], [0, 4], [1, 2], [1, 3], [2, 3], [2, 5], [3, 4], [3, 5], [4, 5], [5, 6], [6, 0]];

  const world = new THREE.Group();
  const orbitLayer = new THREE.Group();
  const nodeLayer = new THREE.Group();
  const flowLayer = new THREE.Group();
  scene.add(world);
  world.add(orbitLayer, flowLayer, nodeLayer);

  scene.add(new THREE.HemisphereLight(0x9beaff, 0x020305, 0.72));
  scene.add(new THREE.PointLight(0x4fffe1, 24, 30, 1.8));
  const warmLight = new THREE.PointLight(0xffaa43, 10, 24, 2);
  warmLight.position.set(-7, 5, 9);
  scene.add(warmLight);

  function makeParticleTexture() {
    const textureCanvas = document.createElement('canvas');
    textureCanvas.width = textureCanvas.height = 64;
    const context = textureCanvas.getContext('2d');
    const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 31);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.2, '#d8ffff');
    gradient.addColorStop(0.55, 'rgba(83,240,255,.45)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(textureCanvas);
  }

  const particleTexture = makeParticleTexture();
  const starCount = compact ? 650 : 1500;
  const starPositions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i += 1) {
    const radius = 18 + Math.random() * 45;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(THREE.MathUtils.randFloatSpread(2));
    starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    starPositions[i * 3 + 1] = radius * Math.cos(phi) * 0.62;
    starPositions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
  }
  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  const starField = new THREE.Points(starGeometry, new THREE.PointsMaterial({ color: 0x7adfe5, size: compact ? 0.09 : 0.12, map: particleTexture, transparent: true, opacity: 0.6, depthWrite: false, blending: THREE.AdditiveBlending }));
  scene.add(starField);

  const grid = new THREE.GridHelper(48, 36, 0x1b8290, 0x12333a);
  grid.position.y = -8.4;
  grid.material.transparent = true;
  grid.material.opacity = 0.24;
  scene.add(grid);

  const core = new THREE.Group();
  const coreShell = new THREE.Mesh(
    new THREE.IcosahedronGeometry(2.15, 2),
    new THREE.MeshPhysicalMaterial({ color: 0x07191d, emissive: 0x25d9d1, emissiveIntensity: 1.5, metalness: 0.72, roughness: 0.16, transmission: 0.08, wireframe: true }),
  );
  const coreOrb = new THREE.Mesh(
    new THREE.SphereGeometry(1.18, 48, 48),
    new THREE.MeshBasicMaterial({ color: 0xc8fff2, transparent: true, opacity: 0.82, blending: THREE.AdditiveBlending }),
  );
  const coreHalo = new THREE.Sprite(new THREE.SpriteMaterial({ map: particleTexture, color: 0x4fffe1, transparent: true, opacity: 0.86, depthWrite: false, blending: THREE.AdditiveBlending }));
  coreHalo.scale.set(8, 8, 1);
  core.add(coreHalo, coreOrb, coreShell);
  world.add(core);

  const rings = [
    { radius: 4.1, tube: 0.018, color: 0x4fffe1, rotation: [Math.PI * 0.47, 0.2, 0.12] },
    { radius: 7.7, tube: 0.022, color: 0x3abed0, rotation: [Math.PI * 0.58, -0.3, 0.3] },
    { radius: 11.3, tube: 0.025, color: 0xffb954, rotation: [Math.PI * 0.54, 0.15, -0.2] },
  ];
  rings.forEach((ring, index) => {
    const mesh = new THREE.Mesh(
      new THREE.TorusGeometry(ring.radius, ring.tube, 8, 180),
      new THREE.MeshBasicMaterial({ color: ring.color, transparent: true, opacity: index === 2 ? 0.27 : 0.45, blending: THREE.AdditiveBlending }),
    );
    mesh.rotation.set(...ring.rotation);
    mesh.userData.speed = (index % 2 ? -1 : 1) * (0.035 + index * 0.012);
    orbitLayer.add(mesh);
  });

  function makeLabel(node) {
    const labelCanvas = document.createElement('canvas');
    labelCanvas.width = 640;
    labelCanvas.height = 144;
    const context = labelCanvas.getContext('2d');
    context.fillStyle = 'rgba(3,12,16,.82)';
    context.strokeStyle = `#${node.color.toString(16).padStart(6, '0')}`;
    context.lineWidth = 3;
    context.beginPath();
    context.roundRect(6, 6, 628, 132, 12);
    context.fill();
    context.stroke();
    context.fillStyle = context.strokeStyle;
    context.font = '700 25px Consolas, monospace';
    context.fillText(node.code, 30, 45);
    context.fillStyle = '#efffff';
    context.font = '700 38px Microsoft YaHei, sans-serif';
    context.fillText(node.label, 30, 103);
    const texture = new THREE.CanvasTexture(labelCanvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false }));
    sprite.scale.set(compact ? 4.8 : 5.6, compact ? 1.08 : 1.26, 1);
    sprite.position.y = 1.75;
    return sprite;
  }

  const interactive = [];
  nodes.forEach((node, index) => {
    const group = new THREE.Group();
    group.position.fromArray(node.position);
    group.userData.base = group.position.clone();
    group.userData.node = node;
    group.userData.phase = index * 0.85;
    const geometry = index % 3 === 0
      ? new THREE.OctahedronGeometry(0.72, 1)
      : index % 3 === 1
        ? new THREE.DodecahedronGeometry(0.72, 0)
        : new THREE.IcosahedronGeometry(0.72, 1);
    const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: node.color, emissive: node.color, emissiveIntensity: 0.58, roughness: 0.24, metalness: 0.62 }));
    mesh.userData.nodeGroup = group;
    const cage = new THREE.Mesh(new THREE.IcosahedronGeometry(1.03, 1), new THREE.MeshBasicMaterial({ color: node.color, wireframe: true, transparent: true, opacity: 0.32 }));
    const halo = new THREE.Mesh(new THREE.TorusGeometry(1.23, 0.026, 8, 72), new THREE.MeshBasicMaterial({ color: node.color, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending }));
    const hitArea = new THREE.Mesh(new THREE.SphereGeometry(1.42, 12, 12), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }));
    hitArea.userData.nodeGroup = group;
    halo.rotation.x = Math.PI / 2;
    group.add(mesh, cage, halo, makeLabel(node), hitArea);
    nodeLayer.add(group);
    interactive.push(hitArea);
  });

  const flows = [];
  links.forEach(([from, to], linkIndex) => {
    const start = new THREE.Vector3(...nodes[from].position);
    const end = new THREE.Vector3(...nodes[to].position);
    const midpoint = start.clone().lerp(end, 0.5);
    midpoint.z += (linkIndex % 2 ? -1 : 1) * (2.2 + start.distanceTo(end) * 0.08);
    midpoint.y += 0.8;
    const curve = new THREE.QuadraticBezierCurve3(start, midpoint, end);
    const curveGeometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(42));
    const line = new THREE.Line(curveGeometry, new THREE.LineBasicMaterial({ color: 0x55d8e5, transparent: true, opacity: 0.17, blending: THREE.AdditiveBlending }));
    flowLayer.add(line);
    const particles = [];
    const count = compact ? 1 : 2;
    for (let i = 0; i < count; i += 1) {
      const particle = new THREE.Sprite(new THREE.SpriteMaterial({ map: particleTexture, color: nodes[to].color, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending }));
      particle.scale.setScalar(compact ? 0.34 : 0.42);
      flowLayer.add(particle);
      particles.push({ sprite: particle, offset: i / count });
    }
    flows.push({ curve, particles, speed: 0.045 + (linkIndex % 4) * 0.009 });
  });

  const detailKind = document.getElementById('graph-detail-kind');
  const detailTitle = document.getElementById('graph-detail-title');
  const detailCopy = document.getElementById('graph-detail-copy');
  const detailTags = document.getElementById('graph-detail-tags');
  document.getElementById('graph-node-count').textContent = nodes.length;
  document.getElementById('graph-link-count').textContent = links.length;

  let selected = null;
  let hovered = null;
  let cameraTween = null;
  function updateDetail(node) {
    detailKind.textContent = node.kind;
    detailTitle.textContent = node.label;
    detailCopy.textContent = node.copy;
    detailTags.replaceChildren(...node.tags.map(tag => {
      const span = document.createElement('span');
      span.textContent = tag;
      return span;
    }));
  }
  function focusNode(group) {
    selected = group;
    updateDetail(group.userData.node);
    const target = group.position.clone();
    const direction = camera.position.clone().sub(controls.target).normalize();
    cameraTween = { start: performance.now(), fromPosition: camera.position.clone(), fromTarget: controls.target.clone(), toPosition: target.clone().add(direction.multiplyScalar(compact ? 14 : 12)), toTarget: target };
    controls.autoRotate = false;
  }
  function resetView() {
    selected = null;
    cameraTween = { start: performance.now(), fromPosition: camera.position.clone(), fromTarget: controls.target.clone(), toPosition: overview.clone(), toTarget: new THREE.Vector3() };
    controls.autoRotate = !reducedMotion;
  }
  updateDetail(nodes[0]);

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2(2, 2);
  function setPointer(event) {
    const bounds = canvas.getBoundingClientRect();
    pointer.set(((event.clientX - bounds.left) / bounds.width) * 2 - 1, -(((event.clientY - bounds.top) / bounds.height) * 2 - 1));
    raycaster.setFromCamera(pointer, camera);
    return raycaster.intersectObjects(interactive, false)[0]?.object?.userData?.nodeGroup || null;
  }
  let pointerDown = null;
  canvas.addEventListener('pointerdown', event => { pointerDown = { x: event.clientX, y: event.clientY }; });
  canvas.addEventListener('pointermove', event => {
    hovered = setPointer(event);
    canvas.style.cursor = hovered ? 'pointer' : event.buttons ? 'grabbing' : 'grab';
    if (!compact) {
      starField.rotation.x = pointer.y * 0.025;
      starField.rotation.y = pointer.x * 0.04;
    }
  }, { passive: true });
  canvas.addEventListener('pointerleave', () => { hovered = null; pointer.set(2, 2); });
  canvas.addEventListener('pointerup', event => {
    if (!pointerDown || Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y) > 7) return;
    const target = setPointer(event);
    if (target) focusNode(target);
    else resetView();
  });

  function resize() {
    const bounds = stage.getBoundingClientRect();
    camera.aspect = bounds.width / Math.max(1, bounds.height);
    camera.updateProjectionMatrix();
    renderer.setSize(bounds.width, bounds.height, false);
    composer.setSize(bounds.width, bounds.height);
  }
  new ResizeObserver(resize).observe(stage);
  resize();

  let visible = true;
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { rootMargin: '160px' }).observe(stage);

  const clock = new THREE.Clock();
  function animate(time) {
    requestAnimationFrame(animate);
    if (!visible) return;
    const elapsed = clock.getElapsedTime();
    controls.update();
    if (cameraTween) {
      const progress = Math.min(1, (time - cameraTween.start) / 850);
      const eased = 1 - Math.pow(1 - progress, 4);
      camera.position.lerpVectors(cameraTween.fromPosition, cameraTween.toPosition, eased);
      controls.target.lerpVectors(cameraTween.fromTarget, cameraTween.toTarget, eased);
      if (progress === 1) cameraTween = null;
    }
    if (!reducedMotion) {
      coreShell.rotation.x = elapsed * 0.16;
      coreShell.rotation.y = elapsed * 0.24;
      coreOrb.scale.setScalar(1 + Math.sin(elapsed * 2.3) * 0.06);
      coreHalo.material.opacity = 0.72 + Math.sin(elapsed * 2.1) * 0.12;
      orbitLayer.children.forEach(ring => { ring.rotation.z += ring.userData.speed * 0.01; });
      grid.position.z = (elapsed * 0.55) % (48 / 36);
      flows.forEach(flow => flow.particles.forEach(particle => {
        const progress = (elapsed * flow.speed + particle.offset) % 1;
        particle.sprite.position.copy(flow.curve.getPoint(progress));
        particle.sprite.scale.setScalar(0.28 + Math.sin(progress * Math.PI) * 0.28);
      }));
      nodeLayer.children.forEach(group => {
        const active = group === selected || group === hovered;
        const targetScale = active ? 1.22 : 1;
        group.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.09);
        group.position.y = group.userData.base.y + Math.sin(elapsed * 0.72 + group.userData.phase) * 0.18;
        group.children[1].rotation.x += 0.0025;
        group.children[1].rotation.y += 0.004;
        group.children[2].rotation.z -= 0.006;
      });
    }
    composer.render();
  }
  animate(performance.now());
}
