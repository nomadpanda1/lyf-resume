(() => {
  const canvas = document.getElementById('resume-graph');
  if (!canvas || !window.THREE || !THREE.OrbitControls) return;

  const stage = canvas.parentElement;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarsePointer = matchMedia('(pointer: coarse)').matches;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, .1, 120);
  camera.position.set(0, 5, coarsePointer ? 31 : 27);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !coarsePointer, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, coarsePointer ? 1.25 : 1.6));
  renderer.setClearColor(0x0b1414, 0);
  canvas.dataset.renderer = 'three-webgl';
  const controls = new THREE.OrbitControls(camera, canvas);
  controls.enableDamping = !reducedMotion;
  controls.dampingFactor = .07;
  controls.enablePan = false;
  controls.minDistance = 16;
  controls.maxDistance = 42;
  controls.maxPolarAngle = Math.PI * .72;
  controls.target.set(0, 0, 0);

  scene.add(new THREE.HemisphereLight(0xd4fff4, 0x07100f, .8));
  const keyLight = new THREE.PointLight(0x6ce2c4, 1.3, 50);
  keyLight.position.set(4, 9, 10);
  scene.add(keyLight);

  const data = [
    { id: 'electrical', label: '电气控制', kind: 'DOMAIN', color: 0xf0b74f, copy: '电路、电机控制、储能调度与工业现场调试。', tags: ['电气工程', '控制', '储能'] },
    { id: 'embedded', label: '嵌入式', kind: 'STACK', color: 0x63e6be, copy: 'STM32、ESP32、Arduino、寄存器级驱动与 PWM 控制。', tags: ['C/C++', 'STM32', 'PWM'] },
    { id: 'robotics', label: '机器人与感知', kind: 'PROJECT', color: 0x7fc8ff, copy: 'ROS2 导航、YDLIDAR 标定、SLAM 与 YOLOX 工业视觉。', tags: ['ROS2', 'SLAM', 'YOLOX'] },
    { id: 'agents', label: 'Graph RAG / Agent', kind: 'PROJECT', color: 0xd4a6ff, copy: 'Cyber-Secretary：Graph RAG、任务拆解与多智能体异步调度。', tags: ['Node.js', 'Graph RAG', 'Multi-Agent'] },
    { id: 'microgrid', label: 'MicroGridSystem', kind: 'PROJECT', color: 0xffd08b, copy: 'C++ 动态仿真内核与 Python 策略调度，覆盖源-网-荷-储工况。', tags: ['C++', 'Python', 'BMS'] },
    { id: 'webgl', label: 'Three.js / WebGL', kind: 'PROJECT', color: 0x8ff5e1, copy: '带电粒子动力学仿真、Three.js 空间渲染与 ECharts 数据映射。', tags: ['Three.js', 'WebGL', 'ECharts'] },
    { id: 'backend', label: '云原生服务', kind: 'STACK', color: 0xff8e83, copy: 'Docker、FastAPI、Node.js、Caddy 与 Cloudflare Tunnel 部署。', tags: ['Docker', 'API', 'Caddy'] },
  ];
  const group = new THREE.Group();
  scene.add(group);
  const meshes = [];
  const positions = [
    [-8, 3, 0], [-3, 5, 1], [4, 4, -1], [8, 1, 0], [3, -4, 1], [-4, -4, -1], [0, 0, 2],
  ];
  const makeMaterial = color => new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: .24, roughness: .35, metalness: .45 });
  data.forEach((node, index) => {
    const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(node.id === 'electrical' ? 1.25 : .82, 1), makeMaterial(node.color));
    mesh.position.set(...positions[index]);
    mesh.userData.node = node;
    group.add(mesh);
    meshes.push(mesh);
  });
  const links = [[0, 1], [0, 4], [0, 6], [1, 2], [1, 6], [2, 3], [2, 6], [3, 4], [4, 5], [4, 6], [5, 6], [6, 1]];
  const linkPoints = [];
  links.forEach(([from, to]) => linkPoints.push(new THREE.Vector3(...positions[from]), new THREE.Vector3(...positions[to])));
  const linkGeometry = new THREE.BufferGeometry().setFromPoints(linkPoints);
  group.add(new THREE.LineSegments(linkGeometry, new THREE.LineBasicMaterial({ color: 0x61d9bf, transparent: true, opacity: .28, blending: THREE.AdditiveBlending })));
  const halo = new THREE.Mesh(new THREE.TorusGeometry(5.5, .025, 8, 96), new THREE.MeshBasicMaterial({ color: 0xf0b74f, transparent: true, opacity: .42, blending: THREE.AdditiveBlending }));
  halo.rotation.x = Math.PI * .52;
  group.add(halo);

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let selected = meshes[0];
  let lastTime = performance.now();
  function show(node) {
    selected = meshes.find(mesh => mesh.userData.node.id === node.id) || selected;
    document.getElementById('graph-detail-kind').textContent = node.kind;
    document.getElementById('graph-detail-title').textContent = node.label;
    document.getElementById('graph-detail-copy').textContent = node.copy;
    document.getElementById('graph-detail-tags').innerHTML = node.tags.map(tag => `<span>${tag}</span>`).join('');
    meshes.forEach(mesh => { mesh.scale.setScalar(mesh === selected ? 1.22 : 1); });
  }
  document.getElementById('graph-node-count').textContent = String(data.length);
  document.getElementById('graph-link-count').textContent = String(links.length);
  show(data[0]);
  function resize() {
    const bounds = stage.getBoundingClientRect();
    camera.aspect = bounds.width / Math.max(1, bounds.height);
    camera.updateProjectionMatrix();
    renderer.setSize(bounds.width, bounds.height, false);
  }
  function hit(event) {
    const bounds = canvas.getBoundingClientRect();
    pointer.set((event.clientX - bounds.left) / bounds.width * 2 - 1, -((event.clientY - bounds.top) / bounds.height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    return raycaster.intersectObjects(meshes, false)[0]?.object?.userData?.node;
  }
  let down = null;
  canvas.addEventListener('pointerdown', event => { down = { x: event.clientX, y: event.clientY }; });
  canvas.addEventListener('pointerup', event => {
    if (down && Math.hypot(event.clientX - down.x, event.clientY - down.y) < 7) {
      const node = hit(event);
      if (node) show(node);
    }
  });
  canvas.addEventListener('pointermove', event => { canvas.style.cursor = hit(event) ? 'pointer' : 'grab'; }, { passive: true });
  function animate(time) {
    requestAnimationFrame(animate);
    const delta = Math.min(.05, (time - lastTime) / 1000);
    lastTime = time;
    controls.update();
    if (!reducedMotion) {
      group.rotation.y += delta * .018;
      halo.rotation.z += delta * .08;
      meshes.forEach((mesh, index) => { mesh.position.y = positions[index][1] + Math.sin(time * .001 + index) * .16; });
    }
    renderer.render(scene, camera);
  }
  new ResizeObserver(resize).observe(stage);
  resize();
  animate(performance.now());
})();
