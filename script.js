/* ═══════════════════════════
   script.js – Portfolio JS
═══════════════════════════ */

if (typeof gsap !== 'undefined') {
  if (typeof ScrollToPlugin !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
  } else if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }
}

// ─── NAVBAR SCROLL ───
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

// ─── HAMBURGER MENU ───
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');

function setMobileMenuOpen(open) {
  if (!hamburger || !navLinks) return;
  hamburger.classList.toggle('open', open);
  navLinks.classList.toggle('mobile-open', open);
  hamburger.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('menu-open', open);
}

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    setMobileMenuOpen(!navLinks.classList.contains('mobile-open'));
  });

  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => setMobileMenuOpen(false));
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 860) setMobileMenuOpen(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setMobileMenuOpen(false);
  });
}

// ─── NEURAL NETWORK CANVAS (2D Background) ───
(function () {
  const canvas = document.getElementById('neural-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, nodes, animId;
  let activeRgb = '0, 212, 255';
  let mouseActive = false;
  let cMouseX = 0;
  let cMouseY = 0;

  const NODE_COUNT = 75;
  const MAX_DIST   = 160;
  const SPEED      = 0.35;

  // Track mouse coordinates for neural connections
  window.addEventListener('mousemove', (e) => {
    mouseActive = true;
    cMouseX = e.clientX;
    cMouseY = e.clientY;
  });

  // Touch support for mobile
  window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      mouseActive = true;
      cMouseX = e.touches[0].clientX;
      cMouseY = e.touches[0].clientY;
    }
  }, { passive: true });

  window.addEventListener('touchend', () => {
    mouseActive = false;
  }, { passive: true });

  window.addEventListener('mouseleave', () => {
    mouseActive = false;
  });

  function updateActiveColor() {
    const style = getComputedStyle(document.documentElement);
    const rgbVal = style.getPropertyValue('--accent-blue-rgb').trim();
    if (rgbVal) {
      activeRgb = rgbVal;
    } else {
      const blueVal = style.getPropertyValue('--accent-blue').trim();
      if (blueVal.startsWith('#')) {
        const r = parseInt(blueVal.slice(1, 3), 16);
        const g = parseInt(blueVal.slice(3, 5), 16);
        const b = parseInt(blueVal.slice(5, 7), 16);
        activeRgb = `${r}, ${g}, ${b}`;
      }
    }
  }
  window.update2DCanvasColor = updateActiveColor;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function createNodes() {
    nodes = Array.from({ length: NODE_COUNT }, () => ({
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - 0.5) * SPEED,
      vy: (Math.random() - 0.5) * SPEED,
      r:  Math.random() * 2 + 1.2,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Gentle gravitational pull and move nodes
    for (const n of nodes) {
      if (mouseActive) {
        const dx = n.x - cMouseX;
        const dy = n.y - cMouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180) {
          // Gently attract to cursor
          n.vx -= (dx / dist) * 0.015;
          n.vy -= (dy / dist) * 0.015;
        }
      }
      
      // Limit node speed
      const speed = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
      if (speed > SPEED * 1.5) {
        n.vx = (n.vx / speed) * SPEED * 1.5;
        n.vy = (n.vy / speed) * SPEED * 1.5;
      }

      n.x += n.vx;
      n.y += n.vy;

      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
    }

    // Draw edges
    for (let i = 0; i < nodes.length; i++) {
      // Connect to mouse cursor
      if (mouseActive) {
        const dx = nodes[i].x - cMouseX;
        const dy = nodes[i].y - cMouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180) {
          const alpha = (1 - dist / 180) * 0.45;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(cMouseX, cMouseY);
          ctx.strokeStyle = `rgba(${activeRgb}, ${alpha})`;
          ctx.lineWidth   = 1.0;
          ctx.stroke();
        }
      }

      for (let j = i + 1; j < nodes.length; j++) {
        const dx   = nodes[i].x - nodes[j].x;
        const dy   = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          const alpha = (1 - dist / MAX_DIST) * 0.35;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(${activeRgb}, ${alpha})`;
          ctx.lineWidth   = 0.8;
          ctx.stroke();
        }
      }
    }

    // Draw nodes
    for (const n of nodes) {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${activeRgb}, 0.7)`;
      ctx.fill();
      // glow
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${activeRgb}, 0.08)`;
      ctx.fill();
    }

    animId = requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => {
    resize();
    createNodes();
  });

  updateActiveColor();
  resize();
  createNodes();
  draw();
})();

// ─── WEBGL 3D INTERACTIVE KINETIC BLOB & PLASMA MESH (Three.js) ───
(function () {
  const canvas = document.getElementById('three-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const isMobile = window.innerWidth <= 860;

  let renderer, scene, camera;
  let geometry, originalPos;
  let glassMesh, wireframeMesh, pointsMesh;

  let mouse = new THREE.Vector2(-9999, -9999);
  let mouseTarget3D = new THREE.Vector3(0, 0, 0);
  let smoothMouse = new THREE.Vector3(0, 0, 0);
  let mouseActive = false;
  
  let themeColor = new THREE.Color(0x00d4ff);
  let scrollPercent = 0;

  // Raycast mouse plane intersection tracking
  const mousePlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const raycaster = new THREE.Raycaster();

  let ambientLight, dirLight, pointLight1, pointLight2;

  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
  } catch (e) {
    console.error("WebGL initialization failed, falling back gracefully", e);
    return;
  }

  scene = new THREE.Scene();
  
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 5.0);
  camera.lookAt(0, 0, 0);

  // LIGHTS - Crucial for glassmorphic specular refractions
  ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
  dirLight.position.set(5, 5, 5);
  scene.add(dirLight);

  // Cursor tracker light (glowing cyan/active theme color)
  pointLight1 = new THREE.PointLight(themeColor, 4.0, 12);
  pointLight1.position.set(-2, 3, 2);
  scene.add(pointLight1);

  // Backlight helper (glowing purple by default for rich dual tones)
  pointLight2 = new THREE.PointLight(0x7c3aed, 3.5, 12);
  pointLight2.position.set(2, -3, 2);
  scene.add(pointLight2);

  // Soft-glowing circular particle texture for points
  function createCircleTexture() {
    const size = 64;
    const ctxCanvas = document.createElement('canvas');
    ctxCanvas.width = size;
    ctxCanvas.height = size;
    const ctx2d = ctxCanvas.getContext('2d');

    const grad = ctx2d.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
    grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.15)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx2d.fillStyle = grad;
    ctx2d.fillRect(0, 0, size, size);

    return new THREE.CanvasTexture(ctxCanvas);
  }
  const particleTexture = createCircleTexture();

  // Create detailed Icosahedron shape (Sphere-like base)
  const detail = isMobile ? 3 : 4;
  geometry = new THREE.IcosahedronGeometry(1.8, detail);
  
  // Clone baseline position attribute
  originalPos = geometry.attributes.position.clone();

  // 1. Premium Iridescent Liquid Chrome Fluid Mesh
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x0c111e, // rich deep space chrome base
    roughness: 0.08, // highly polished chrome
    metalness: 0.95, // near pure metal
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
    transmission: 0.38, // semi-transmissive liquid metal to let inner core shine through
    thickness: 1.8,
    ior: 1.68, // higher refractive index for dramatic outlines
    transparent: true,
    opacity: 0.90,
    side: THREE.DoubleSide,
    flatShading: false
  });
  glassMesh = new THREE.Mesh(geometry, glassMat);
  scene.add(glassMesh);

  // 2. Glowing Outer Wireframe Exoskeleton Shell (scale 1.01)
  const meshMat = new THREE.MeshBasicMaterial({
    color: themeColor,
    wireframe: true,
    transparent: true,
    opacity: 0.22,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  wireframeMesh = new THREE.Mesh(geometry, meshMat);
  wireframeMesh.scale.set(1.01, 1.01, 1.01);
  scene.add(wireframeMesh);

  // 3. Glowing Inner Plasma Points core (scale 0.98, nested inside glass)
  const pointsMat = new THREE.PointsMaterial({
    size: isMobile ? 0.08 : 0.06,
    map: particleTexture,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
    color: themeColor
  });
  pointsMesh = new THREE.Points(geometry, pointsMat);
  pointsMesh.scale.set(0.98, 0.98, 0.98);
  scene.add(pointsMesh);



  // Mouse move listener
  window.addEventListener('mousemove', (e) => {
    mouseActive = true;
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  window.addEventListener('mouseleave', () => {
    mouseActive = false;
    mouse.x = -9999;
    mouse.y = -9999;
  });

  // Track scroll position
  window.addEventListener('scroll', () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (maxScroll > 0) {
      scrollPercent = window.scrollY / maxScroll;
    }
  });

  // Keep colors updated
  function getActiveThemeColors() {
    const style = getComputedStyle(document.documentElement);
    const blueVal = style.getPropertyValue('--accent-blue').trim();
    return blueVal || '#00d4ff';
  }

  function updateActiveColors() {
    const colors = getActiveThemeColors();
    const targetColor = new THREE.Color(colors);

    // Complementary secondary color (rotate hue for dual spotlight contrasts)
    const secondaryColor = targetColor.clone().offsetHSL(0.28, 0, 0);

    // Transition material colors and point light 1 color smoothly using GSAP tweens
    gsap.to(themeColor, {
      r: targetColor.r,
      g: targetColor.g,
      b: targetColor.b,
      duration: 0.8,
      ease: 'power2.out',
      onUpdate: () => {
        meshMat.color.copy(themeColor);
        pointsMat.color.copy(themeColor);
        pointLight1.color.copy(themeColor);
      }
    });

    // Smoothly transition secondary light color
    gsap.to(pointLight2.color, {
      r: secondaryColor.r,
      g: secondaryColor.g,
      b: secondaryColor.b,
      duration: 0.8,
      ease: 'power2.out'
    });
  }
  window.updateThreeCanvasColor = updateActiveColors;

  // Aspect ratio resize handler
  function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', resize);

  // Performance Observer
  let isInView = true;
  const canvasObserver = new IntersectionObserver((entries) => {
    isInView = entries[0].isIntersecting;
  }, { threshold: 0.01 });
  canvasObserver.observe(canvas);

  // 3D Render Loop
  let time = 0;
  function animate() {
    requestAnimationFrame(animate);
    if (!isInView) return;

    time += 0.007;

    // Project mouse cursor to 3D space
    if (mouseActive) {
      raycaster.setFromCamera(mouse, camera);
      raycaster.ray.intersectPlane(mousePlane, mouseTarget3D);
      smoothMouse.lerp(mouseTarget3D, 0.08); // smooth damping
      
      // Update point light 1 position to follow cursor closely for interactive glass highlights
      pointLight1.position.copy(smoothMouse);
      pointLight1.position.z = 1.8; // hover slightly above the mesh plane
    } else {
      // Float target tracker light slowly when mouse is inactive
      pointLight1.position.x = Math.sin(time) * 1.5;
      pointLight1.position.y = Math.cos(time * 0.8) * 1.5;
      pointLight1.position.z = 2.0;
    }

    // Oscillate light colors around the active theme color HSL base for iridescent reflections
    const activeHSL = {};
    themeColor.getHSL(activeHSL);
    const dynamicHue1 = (activeHSL.h + Math.sin(time * 0.35) * 0.12 + 1.0) % 1.0;
    const dynamicHue2 = (activeHSL.h + 0.28 + Math.cos(time * 0.25) * 0.10 + 1.0) % 1.0;
    pointLight1.color.setHSL(dynamicHue1, 0.95, activeHSL.l);
    pointLight2.color.setHSL(dynamicHue2, 0.95, 0.5);

    // Float spotlight 2 slowly around the back side for shifting kinetic reflections
    pointLight2.position.x = Math.cos(time * 0.6) * 3.5;
    pointLight2.position.y = Math.sin(time * 0.4) * 2.0;
    pointLight2.position.z = Math.sin(time * 0.6) * 3.5;

    // Scroll morph weights
    let t1 = 0, t2 = 0, t3 = 0;
    if (scrollPercent < 0.45) {
      const t = scrollPercent / 0.45;
      t1 = 1.0 - t;
      t2 = t;
    } else if (scrollPercent < 0.85) {
      const t = (scrollPercent - 0.45) / 0.40;
      t2 = 1.0 - t;
      t3 = t;
    } else {
      t3 = 1.0;
    }

    // Update organic geometry morphing
    const posAttr = geometry.attributes.position;
    const activePositions = posAttr.array;
    const origPositions = originalPos.array;
    const vertexCount = posAttr.count;

    for (let i = 0; i < vertexCount; i++) {
      const i3 = i * 3;
      const ox = origPositions[i3];
      const oy = origPositions[i3 + 1];
      const oz = origPositions[i3 + 2];

      const vDir = new THREE.Vector3(ox, oy, oz).normalize();

      // State 0: Kinetic Jelly Blob (3D Wave interference)
      const wave1 = Math.sin(vDir.x * 2.5 + time * 1.6) * Math.cos(vDir.y * 2.5 - time * 1.3) * Math.sin(vDir.z * 2.5 + time * 1.9);
      const wave2 = Math.sin(vDir.x * 6.0 - time * 2.2) * Math.cos(vDir.z * 6.0 + time * 1.7) * 0.18;
      const radius = 1.7 + wave1 * 0.52 + wave2 * 0.15;
      
      const s0_X = vDir.x * radius;
      const s0_Y = vDir.y * radius;
      const s0_Z = vDir.z * radius;

      // State 1: Twist DNA Helix (Stretched spiral helix along height)
      const spiralAngle = (oy + 3.0) * 1.4 + time * 1.5;
      const spiralRad = 0.95 + Math.sin(time + oy * 2.2) * 0.22;
      
      const s1_X = spiralRad * Math.cos(spiralAngle);
      const s1_Y = oy * 1.15;
      const s1_Z = spiralRad * Math.sin(spiralAngle);

      // State 2: Waving Landscape Terrain (Flat wave grid)
      const gridX = (ox / 1.8) * 4.6;
      const gridZ = (oz / 1.8) * 4.6;
      const gridY = -1.3 + Math.sin(gridX * 1.4 + time * 1.8) * Math.cos(gridZ * 1.4 + time * 1.4) * 0.42;
      
      const s2_X = gridX;
      const s2_Y = gridY;
      const s2_Z = gridZ;

      // Interpolate coordinates across States
      let tx = s0_X * t1 + s1_X * t2 + s2_X * t3;
      let ty = s0_Y * t1 + s1_Y * t2 + s2_Y * t3;
      let tz = s0_Z * t1 + s1_Z * t2 + s2_Z * t3;

      // Cursor tactile warp deflection ("Poke" indentation)
      if (mouseActive) {
        const dx = tx - smoothMouse.x;
        const dy = ty - smoothMouse.y;
        const dz = tz - smoothMouse.z; // FIXED BUG: changed pz to tz
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
        const touchRadius = isMobile ? 1.0 : 2.0;

        if (dist < touchRadius) {
          const force = (1.0 - dist / touchRadius) * 0.45;
          // Displace vertex inward towards the core center, creating a tactile poke dent
          tx -= vDir.x * force * 0.8;
          ty -= vDir.y * force * 0.8;
          tz -= vDir.z * force * 0.8;
        }
      }

      // Write values back
      activePositions[i3]     = tx;
      activePositions[i3 + 1] = ty;
      activePositions[i3 + 2] = tz;
    }
    posAttr.needsUpdate = true;
    geometry.computeVertexNormals(); // Crucial for real-time glass physical lighting refractions!

    // Slow, organic baseline rotation
    glassMesh.rotation.y += 0.0018;
    glassMesh.rotation.x = Math.sin(time * 0.12) * 0.08;
    wireframeMesh.rotation.copy(glassMesh.rotation);
    pointsMesh.rotation.copy(glassMesh.rotation);

    // Scroll-linked camera translation target
    let targetCamX = 0;
    let targetCamY = 0;
    let targetCamZ = 5.0;
    let targetLookY = 0;

    if (scrollPercent < 0.45) {
      // Hero (Centered close-up) down to About (Stretched helix view)
      const t = scrollPercent / 0.45;
      targetCamY = t * 0.4;
      targetCamZ = 5.0 + t * 1.3;
      targetLookY = -t * 0.1;
    } else if (scrollPercent < 0.85) {
      // Skills/Projects (Perspective angle looking down at grid landscape)
      const t = (scrollPercent - 0.45) / 0.40;
      targetCamY = 0.4 + t * 2.1;
      targetCamZ = 6.3 - t * 0.5;
      targetLookY = -0.1 - t * 0.8;
    } else {
      // Contact
      const t = (scrollPercent - 0.85) / 0.15;
      targetCamY = 2.5 + t * 0.5;
      targetCamZ = 5.8 + t * 0.4;
      targetLookY = -0.9 + t * 0.2;
    }

    // Camera coordinate smoothing
    camera.position.x += (targetCamX - camera.position.x) * 0.06;
    camera.position.y += (targetCamY - camera.position.y) * 0.06;
    camera.position.z += (targetCamZ - camera.position.z) * 0.06;

    const lookTarget = new THREE.Vector3(0, targetLookY, 0);
    camera.lookAt(lookTarget);

    // Camera mouse drift parallax (Desktop only)
    if (mouseActive && !isMobile) {
      camera.position.x += mouse.x * 0.18;
      camera.position.y += mouse.y * 0.15;
    }

    renderer.render(scene, camera);
  }

  // Initialize
  updateActiveColors();
  resize();
  animate();
})();

// ─── COUNTER ANIMATION ───
function animateCounter(el) {
  const target   = parseInt(el.dataset.count, 10);
  const duration = 1600;
  const start    = performance.now();

  function update(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease     = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
    el.textContent = Math.round(ease * target);
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

// ─── SCROLL REVEAL + COUNTER TRIGGER ───
const revealEls  = document.querySelectorAll('.reveal');
const counterEls = document.querySelectorAll('.stat-number');
let countersStarted = false;

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => observer.observe(el));

// Counter observer (fire once when hero stats visible)
const counterObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting && !countersStarted) {
    countersStarted = true;
    counterEls.forEach(animateCounter);
    counterObserver.disconnect();
  }
}, { threshold: 0.5 });

const statsEl = document.querySelector('.hero-stats');
if (statsEl) counterObserver.observe(statsEl);

// ─── PROJECT FILTER ───
const filterBtns   = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');
const showProjectsBtn = document.getElementById('show-projects-btn');
const showProjectsLabel = document.getElementById('show-projects-label');
const INITIAL_PROJECT_LIMIT = 3;
let showingAllProjects = false;

function updateProjectLimit() {
  if (!showProjectsBtn) return;

  projectCards.forEach((card, index) => {
    card.classList.toggle('project-collapsed', !showingAllProjects && index >= INITIAL_PROJECT_LIMIT);
  });

  const hasHiddenProjects = projectCards.length > INITIAL_PROJECT_LIMIT;
  showProjectsBtn.hidden = !hasHiddenProjects;
  showProjectsBtn.setAttribute('aria-expanded', String(showingAllProjects));
  if (showProjectsLabel) {
    showProjectsLabel.textContent = showingAllProjects ? 'Show Featured Projects' : 'Show All Projects';
  }
}

updateProjectLimit();

if (showProjectsBtn) {
  showProjectsBtn.addEventListener('click', () => {
    showingAllProjects = !showingAllProjects;
    updateProjectLimit();
  });
}

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    projectCards.forEach(card => {
      const match = filter === 'all' || card.dataset.category === filter;
      card.classList.toggle('hidden', !match);
    });
    updateProjectLimit();
  });
});

// ─── CONTACT FORM (FormSubmit by default, or Web3Forms via config.js) ───
const CONTACT_CONFIG = {
  provider: 'formsubmit',
  recipientEmail: 'hetthummar2474@gmail.com',
  web3formsAccessKey: '',
  ...(window.PORTFOLIO_CONFIG || {})
};

const SEND_ICON = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`;

function usesWeb3Forms() {
  const key = (CONTACT_CONFIG.web3formsAccessKey || '').trim();
  return CONTACT_CONFIG.provider === 'web3forms' && key.length > 0;
}

async function submitViaWeb3Forms(payload) {
  const response = await fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({
      access_key: CONTACT_CONFIG.web3formsAccessKey.trim(),
      name: payload.name,
      email: payload.email,
      subject: payload.subject,
      message: payload.message,
      from_name: 'Portfolio — Het Thummar',
      replyto: payload.email,
      botcheck: ''
    })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success === false) {
    throw new Error(data.message || 'Web3Forms rejected the submission.');
  }
  return data;
}

async function submitViaFormSubmit(payload) {
  const email = (CONTACT_CONFIG.recipientEmail || 'hetthummar2474@gmail.com').trim();
  const formData = new FormData();
  formData.append('name', payload.name);
  formData.append('email', payload.email);
  formData.append('message', payload.message);
  formData.append('_subject', payload.subject);
  formData.append('_replyto', payload.email);
  formData.append('_captcha', 'false');
  formData.append('_template', 'table');

  const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(email)}`, {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body: formData
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Could not send message. Try again in a moment.');
  }
  return data;
}

const contactForm = document.getElementById('contact-form');
const submitBtn = document.getElementById('submit-btn');
const formStatus = document.getElementById('form-status');
const botcheck = document.getElementById('botcheck');

function setFormStatus(message, type) {
  if (!formStatus) return;
  formStatus.textContent = message;
  formStatus.classList.remove('success', 'error');
  if (type) formStatus.classList.add(type);
  formStatus.hidden = !message;
}

function resetSubmitButton(delay = 4000) {
  setTimeout(() => {
    if (!submitBtn) return;
    submitBtn.disabled = false;
    submitBtn.innerHTML = `Send Message ${SEND_ICON}`;
    submitBtn.style.background = '';
  }, delay);
}

if (contactForm && submitBtn) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (botcheck && botcheck.checked) return;

    const nameInput = document.getElementById('name-input');
    const emailInput = document.getElementById('email-input');
    const subjectInput = document.getElementById('subject-input');
    const messageInput = document.getElementById('message-input');

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const subject = subjectInput.value.trim() || 'New Portfolio Message';
    const message = messageInput.value.trim();

    if (!name) return shake(nameInput);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return shake(emailInput);
    if (!message) return shake(messageInput);

    setFormStatus('', null);
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin-icon">
        <path d="M21 12a9 9 0 11-3.1-6.8"/>
      </svg>
      Sending…`;

    try {
      const payload = { name, email, subject, message };
      if (usesWeb3Forms()) {
        await submitViaWeb3Forms(payload);
      } else {
        await submitViaFormSubmit(payload);
      }

      submitBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        Message Sent!`;
      submitBtn.style.background = 'linear-gradient(135deg,#00c97a,#00d4ff)';
      setFormStatus('Thanks! Your message was sent. I will get back to you soon.', 'success');
      contactForm.reset();
      resetSubmitButton();
    } catch (err) {
      console.error('Contact form error:', err);
      submitBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
        Failed to Send`;
      submitBtn.style.background = 'linear-gradient(135deg,#ff3366,#ff6b6b)';
      setFormStatus(
        err.message || 'Something went wrong. Email me directly at hetthummar2474@gmail.com.',
        'error'
      );
      resetSubmitButton();
    }
  });
}

function shake(el) {
  el.style.animation = 'shake 0.35s ease';
  el.addEventListener('animationend', () => el.style.animation = '', { once: true });
  el.focus();
}

// Inject shake keyframe
const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%,100%{transform:translateX(0)}
    20%{transform:translateX(-6px)}
    40%{transform:translateX(6px)}
    60%{transform:translateX(-4px)}
    80%{transform:translateX(4px)}
  }
  .spin-icon {
    animation: rotateSpin 0.8s linear infinite;
  }
  @keyframes rotateSpin {
    from{transform:rotate(0deg)}
    to{transform:rotate(360deg)}
  }
`;
document.head.appendChild(style);

// ─── SMOOTH ACTIVE NAV HIGHLIGHT ───
const sections  = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-link');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navAnchors.forEach(a => {
        a.style.color = a.getAttribute('href') === `#${entry.target.id}`
          ? 'var(--accent-blue)' : '';
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => sectionObserver.observe(s));

// ─── RESUME PREVIEW MODAL ───
const resumeModal = document.getElementById('resume-modal');
const modalOverlay = document.getElementById('modal-overlay');
const modalCloseBtn = document.getElementById('modal-close-btn');
const navResumeBtn = document.getElementById('nav-resume-btn');
const heroResumeBtn = document.getElementById('hero-resume-btn');

function openResume() {
  if (resumeModal) {
    resumeModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeResume() {
  if (resumeModal) {
    resumeModal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

const navResumeMobileBtn = document.getElementById('nav-resume-mobile-btn');

function handleResumeClick() {
  setMobileMenuOpen(false);
  openResume();
}

if (navResumeBtn) navResumeBtn.addEventListener('click', openResume);
if (navResumeMobileBtn) navResumeMobileBtn.addEventListener('click', handleResumeClick);
if (heroResumeBtn) heroResumeBtn.addEventListener('click', openResume);
if (modalOverlay) modalOverlay.addEventListener('click', closeResume);
if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeResume);

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeResume();
});

// ─── THEME CUSTOMIZER ───
const customizerToggle = document.getElementById('customizer-toggle');
const colorOpts = document.querySelectorAll('.color-opt');
const colorOptions = document.getElementById('color-options');

if (customizerToggle) {
  customizerToggle.addEventListener('click', () => {
    customizerToggle.classList.toggle('active');
  });
}

colorOpts.forEach(opt => {
  opt.addEventListener('click', () => {
    const theme = opt.dataset.theme;
    colorOpts.forEach(o => o.classList.remove('active'));
    opt.classList.add('active');
    
    // Apply theme colors with RGB support for glow and spotlights
    const themes = {
      cyber: { blue: '#00d4ff', blueRgb: '0, 212, 255', purple: '#7c3aed' },
      emerald: { blue: '#10b981', blueRgb: '16, 185, 129', purple: '#84cc16' },
      sunset: { blue: '#f97316', blueRgb: '249, 115, 22', purple: '#f43f5e' },
      rose: { blue: '#ec4899', blueRgb: '236, 72, 153', purple: '#8b5cf6' },
      gold: { blue: '#fbbf24', blueRgb: '251, 191, 36', purple: '#d97706' },
      quantum: { blue: '#00f5ff', blueRgb: '0, 245, 255', purple: '#00ff88' }
    };
    
    if (themes[theme]) {
      document.documentElement.style.setProperty('--accent-blue', themes[theme].blue);
      document.documentElement.style.setProperty('--accent-blue-rgb', themes[theme].blueRgb);
      document.documentElement.style.setProperty('--accent-purple', themes[theme].purple);
      localStorage.setItem('portfolio-theme', theme);
      
      if (typeof window.update2DCanvasColor === 'function') window.update2DCanvasColor();
      if (typeof window.updateThreeCanvasColor === 'function') window.updateThreeCanvasColor();
      
      // Close panel after selection
      customizerToggle.classList.remove('active');
    }
  });
});

// Load saved theme
const savedTheme = localStorage.getItem('portfolio-theme');
if (savedTheme) {
  const savedOpt = document.querySelector(`[data-theme="${savedTheme}"]`);
  if (savedOpt) {
    savedOpt.click();
  } else {
    if (typeof window.update2DCanvasColor === 'function') window.update2DCanvasColor();
    if (typeof window.updateThreeCanvasColor === 'function') window.updateThreeCanvasColor();
  }
} else {
  if (typeof window.update2DCanvasColor === 'function') window.update2DCanvasColor();
  if (typeof window.updateThreeCanvasColor === 'function') window.updateThreeCanvasColor();
}

// ─── PREMIUM FACELIFT INTERACTIONS ───
(function () {
  // Disable cursor follower on touch environments
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (isTouch) return;

  const cursorDot = document.getElementById('custom-cursor-dot');
  const cursorFollower = document.getElementById('custom-cursor-follower');

  let mouseX = -100, mouseY = -100;
  let followerX = -100, followerY = -100;

  // Track mouse coordinates globally
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (cursorDot && cursorFollower) {
      cursorDot.style.opacity = '1';
      cursorFollower.style.opacity = '1';
    }

    // Event Delegation: Spotlight Card tracking
    const card = e.target.closest('.glass-card, .project-card');
    if (card) {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mx', `${x}%`);
      card.style.setProperty('--my', `${y}%`);
    }
  }, { passive: true });

  // Hide cursor on window exit
  document.addEventListener('mouseleave', () => {
    if (cursorDot && cursorFollower) {
      cursorDot.style.opacity = '0';
      cursorFollower.style.opacity = '0';
    }
  });

  document.addEventListener('mouseenter', () => {
    if (cursorDot && cursorFollower) {
      cursorDot.style.opacity = '1';
      cursorFollower.style.opacity = '1';
    }
  });

  // Render loop for smooth cursor follower
  function updateCursor() {
    const dx = mouseX - followerX;
    const dy = mouseY - followerY;
    followerX += dx * 0.14;
    followerY += dy * 0.14;

    if (cursorDot) {
      cursorDot.style.transform = `translate3d(calc(${mouseX}px - 50%), calc(${mouseY}px - 50%), 0)`;
    }
    if (cursorFollower) {
      cursorFollower.style.transform = `translate3d(calc(${followerX}px - 50%), calc(${followerY}px - 50%), 0)`;
    }
    requestAnimationFrame(updateCursor);
  }
  updateCursor();

  // Cursor Active Highlight (Event Delegation)
  document.addEventListener('mouseover', (e) => {
    const target = e.target.closest('a, button, .btn, .glass-card, .project-card, .skill-pill, .social-link, .color-opt, .hamburger');
    if (target && cursorFollower) {
      cursorFollower.classList.add('active');
    }
  });

  document.addEventListener('mouseout', (e) => {
    const target = e.target.closest('a, button, .btn, .glass-card, .project-card, .skill-pill, .social-link, .color-opt, .hamburger');
    if (target && cursorFollower) {
      cursorFollower.classList.remove('active');
    }
  });

  // ─── MAGNETIC BUTTONS & LINKS (using GSAP if loaded) ───
  if (typeof gsap !== 'undefined') {
    const magnetics = document.querySelectorAll('.logo-container, .btn, .social-link, .hamburger, .customizer-toggle, .back-to-top');

    magnetics.forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const elX = rect.left + rect.width / 2;
        const elY = rect.top + rect.height / 2;

        const deltaX = e.clientX - elX;
        const deltaY = e.clientY - elY;

        // Pull element 28% toward the mouse cursor smoothly
        gsap.to(el, {
          x: deltaX * 0.28,
          y: deltaY * 0.28,
          duration: 0.35,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      });

      el.addEventListener('mouseleave', () => {
        // Snap smoothly back to center with elastic bounce
        gsap.to(el, {
          x: 0,
          y: 0,
          duration: 0.5,
          ease: 'elastic.out(1, 0.45)',
          overwrite: 'auto'
        });
      });
    });
  }
})();

// ─── BACK TO TOP BUTTON ───
const backToTopBtn = document.getElementById('back-to-top');

function scrollToTop() {
  if (typeof gsap !== 'undefined') {
    gsap.killTweensOf(window);
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

if (backToTopBtn) {
  let backToTopTicking = false;

  window.addEventListener('scroll', () => {
    if (backToTopTicking) return;
    backToTopTicking = true;
    requestAnimationFrame(() => {
      backToTopBtn.classList.toggle('visible', window.scrollY > 300);
      backToTopTicking = false;
    });
  }, { passive: true });

  backToTopBtn.addEventListener('click', (e) => {
    e.preventDefault();
    scrollToTop();
  });
}

// ─── SMOOTH SCROLL FOR ANCHOR LINKS ───
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    if (href === '#') return;
    
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      if (typeof ScrollToPlugin !== 'undefined') {
        gsap.to(window, {
          duration: 1,
          scrollTo: { y: target, offsetY: 80 },
          ease: 'power2.inOut'
        });
      } else {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  });
});

// ─── GSAP ANIMATIONS ───
// Proper mobile detection - check both screen size AND touch capability
const isMobile = window.innerWidth <= 860 || ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

// Set initial states for animated elements
gsap.set('.hero-title, .hero-subtitle, .hero-cta .btn', { opacity: 1, y: 0, x: 0 });
gsap.set('.section-title, .skill-category, .project-card, .education-card, .blog-card', { opacity: 1, y: 0, x: 0 });
gsap.set('.about-avatar, .about-text, .contact-wrapper', { opacity: 1, y: 0, x: 0, scale: 1 });

// ─── SCROLL PROGRESS BAR ───
const scrollProgressBar = document.getElementById('scroll-progress-bar');
if (scrollProgressBar) {
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollProgressBar.style.width = progress + '%';
  }, { passive: true });
}

if (!isMobile) {
  // ══════════════════════════════════════
  // HERO ENTRANCE ANIMATIONS
  // ══════════════════════════════════════
  gsap.from('.hero-title', {
    duration: 1.2,
    y: 50,
    opacity: 0,
    ease: 'power4.out',
    delay: 0.1
  });

  // Hero subtitle fade in
  gsap.from('.hero-subtitle', {
    duration: 1,
    y: 30,
    opacity: 0,
    delay: 0.5,
    ease: 'power4.out'
  });

  // Hero CTA buttons - staggered entrance
  gsap.from('.hero-cta .btn', {
    duration: 0.9,
    y: 25,
    opacity: 0,
    delay: 0.7,
    stagger: 0.15,
    ease: 'power4.out'
  });

  // ══════════════════════════════════════
  // HERO PARALLAX DEPTH LAYERS
  // ══════════════════════════════════════
  gsap.to('.hero-content', {
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 0.8
    },
    y: 120,
    opacity: 0,
    ease: 'none'
  });

  gsap.to('#neural-canvas', {
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 0.5
    },
    y: 60,
    ease: 'none'
  });

  // ══════════════════════════════════════
  // SECTION TITLES – SMOOTH FADE-UP
  // ══════════════════════════════════════
  gsap.utils.toArray('.section-title').forEach(title => {
    if (title.closest('.hero-content') || title.closest('.hero')) return;
    gsap.from(title, {
      scrollTrigger: {
        trigger: title,
        start: 'top 85%',
        toggleActions: 'play none none none'
      },
      duration: 0.9,
      y: 35,
      opacity: 0,
      ease: 'power4.out'
    });
  });

  // Section subtitles fade in
  gsap.utils.toArray('.section-sub').forEach(sub => {
    gsap.from(sub, {
      scrollTrigger: {
        trigger: sub,
        start: 'top 88%',
        toggleActions: 'play none none none'
      },
      duration: 0.8,
      y: 20,
      opacity: 0,
      ease: 'power2.out'
    });
  });

  // Section tags slide in
  gsap.utils.toArray('.section-tag').forEach(tag => {
    gsap.from(tag, {
      scrollTrigger: {
        trigger: tag,
        start: 'top 90%',
        toggleActions: 'play none none none'
      },
      duration: 0.6,
      x: -30,
      opacity: 0,
      ease: 'power2.out'
    });
  });

  // ══════════════════════════════════════
  // ABOUT SECTION – PARALLAX BADGES
  // ══════════════════════════════════════
  gsap.from('.about-avatar', {
    scrollTrigger: {
      trigger: '.about-section',
      start: 'top 75%',
      toggleActions: 'play none none none'
    },
    duration: 1.2,
    scale: 0.8,
    opacity: 0,
    ease: 'back.out(1.4)'
  });

  gsap.from('.about-text', {
    scrollTrigger: {
      trigger: '.about-section',
      start: 'top 75%',
      toggleActions: 'play none none none'
    },
    duration: 1,
    x: 60,
    opacity: 0,
    delay: 0.15,
    ease: 'power3.out'
  });

  // Floating badges parallax on scroll
  const floatBadges = document.querySelectorAll('.about-card-float');
  floatBadges.forEach((badge, i) => {
    const direction = i % 2 === 0 ? 1 : -1;
    gsap.to(badge, {
      scrollTrigger: {
        trigger: '.about-section',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1
      },
      y: direction * (30 + i * 10),
      x: direction * (15 + i * 5),
      ease: 'none'
    });
  });

  // ══════════════════════════════════════
  // EDUCATION – SCROLL-SCRUBBED TIMELINE DOT
  // ══════════════════════════════════════
  const scrubDot = document.querySelector('.edu-timeline-dot-scrub');
  const eduContainer = document.querySelector('.edu-timeline-container');
  
  if (scrubDot && eduContainer && !isMobile) {
    gsap.fromTo(scrubDot, {
      top: '0%'
    }, {
      top: '100%',
      scrollTrigger: {
        trigger: eduContainer,
        start: 'top 65%',
        end: 'bottom 45%',
        scrub: 0.5,
      }
    });
  }

  // ══════════════════════════════════════
  // SKILL CARDS – SMOOTH ENTRY
  // ══════════════════════════════════════
  gsap.utils.toArray('.skill-category').forEach((card, index) => {
    gsap.from(card, {
      scrollTrigger: {
        trigger: card,
        start: 'top 92%',
        toggleActions: 'play none none none'
      },
      duration: 0.8,
      y: 40,
      opacity: 0,
      delay: (index % 3) * 0.1,
      ease: 'power3.out'
    });
  });


  // ══════════════════════════════════════
  // PROJECT CARDS – 3D PERSPECTIVE TILT ENTRY
  // ══════════════════════════════════════
  gsap.utils.toArray('.project-card').forEach((card, index) => {
    gsap.from(card, {
      scrollTrigger: {
        trigger: card,
        start: 'top 90%',
        toggleActions: 'play none none none'
      },
      duration: 0.9,
      y: 50,
      rotateX: 10,
      opacity: 0,
      transformOrigin: 'center bottom',
      delay: (index % 3) * 0.1,
      ease: 'power3.out'
    });
  });

  // ══════════════════════════════════════
  // BLOG CARDS – 3D PERSPECTIVE TILT ENTRY
  // ══════════════════════════════════════
  gsap.utils.toArray('.blog-card').forEach((card, index) => {
    gsap.from(card, {
      scrollTrigger: {
        trigger: card,
        start: 'top 90%',
        toggleActions: 'play none none none'
      },
      duration: 0.9,
      y: 50,
      rotateX: 10,
      opacity: 0,
      transformOrigin: 'center bottom',
      delay: (index % 3) * 0.1,
      ease: 'power3.out'
    });
  });

  // ══════════════════════════════════════
  // CONTACT – SMOOTH ENTRANCE
  // ══════════════════════════════════════
  gsap.from('.contact-wrapper', {
    scrollTrigger: {
      trigger: '.contact-section',
      start: 'top 80%',
      toggleActions: 'play none none none'
    },
    duration: 1,
    y: 50,
    opacity: 0,
    ease: 'power3.out'
  });

  // ══════════════════════════════════════
  // LIQUID GLASS SHIMMER ON SCROLL
  // ══════════════════════════════════════
  gsap.utils.toArray('.liquid-glass').forEach(el => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 80%',
      onEnter: () => {
        el.classList.add('shimmer-active');
        // Remove after animation so it can re-trigger
        setTimeout(() => el.classList.remove('shimmer-active'), 1300);
      }
    });
  });

  // ══════════════════════════════════════
  // HIGHLIGHT ITEMS STAGGER
  // ══════════════════════════════════════
  gsap.utils.toArray('.highlight-item').forEach((item, index) => {
    gsap.from(item, {
      scrollTrigger: {
        trigger: item,
        start: 'top 90%',
        toggleActions: 'play none none none'
      },
      duration: 0.6,
      x: -30,
      opacity: 0,
      delay: index * 0.1,
      ease: 'power2.out'
    });
  });

  // ══════════════════════════════════════
  // CONTACT INFO ITEMS STAGGER
  // ══════════════════════════════════════
  gsap.utils.toArray('.contact-info-item').forEach((item, index) => {
    gsap.from(item, {
      scrollTrigger: {
        trigger: item,
        start: 'top 92%',
        toggleActions: 'play none none none'
      },
      duration: 0.5,
      x: -20,
      opacity: 0,
      delay: index * 0.08,
      ease: 'power2.out'
    });
  });

  // ══════════════════════════════════════
  // FOOTER STAGGER ENTRANCE
  // ══════════════════════════════════════
  gsap.from('.footer-top', {
    scrollTrigger: {
      trigger: '.footer',
      start: 'top 92%',
      toggleActions: 'play none none none'
    },
    duration: 0.7,
    y: 25,
    opacity: 0,
    ease: 'power2.out'
  });

  gsap.utils.toArray('.social-link').forEach((link, index) => {
    gsap.from(link, {
      scrollTrigger: {
        trigger: link,
        start: 'top 95%',
        toggleActions: 'play none none none'
      },
      duration: 0.4,
      y: 15,
      opacity: 0,
      delay: index * 0.06,
      ease: 'power2.out'
    });
  });

  // ══════════════════════════════════════
  // HOVER ANIMATIONS (desktop only — touch has no hover)
  // ══════════════════════════════════════
  if (!isTouch) {
    // Smooth hover for buttons
    gsap.utils.toArray('.btn').forEach(btn => {
      btn.addEventListener('mouseenter', () => {
        gsap.to(btn, { duration: 0.35, y: -4, ease: 'power2.out' });
      });
      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { duration: 0.35, y: 0, ease: 'power2.out' });
      });
    });

    // Smooth hover for glass cards
    gsap.utils.toArray('.glass-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        gsap.to(card, { duration: 0.35, y: -6, ease: 'power2.out' });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(card, { duration: 0.35, y: 0, ease: 'power2.out' });
      });
    });

    // Smooth hover for project cards
    gsap.utils.toArray('.project-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        gsap.to(card, { duration: 0.35, y: -8, ease: 'power2.out' });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(card, { duration: 0.35, y: 0, ease: 'power2.out' });
      });
    });

    // Smooth hover for skill pills
    gsap.utils.toArray('.skill-pill').forEach(pill => {
      pill.addEventListener('mouseenter', () => {
        gsap.to(pill, { duration: 0.3, y: -3, ease: 'power2.out' });
      });
      pill.addEventListener('mouseleave', () => {
        gsap.to(pill, { duration: 0.3, y: 0, ease: 'power2.out' });
      });
    });

    // Smooth hover for color options
    gsap.utils.toArray('.color-opt').forEach(opt => {
      opt.addEventListener('mouseenter', () => {
        gsap.to(opt, { duration: 0.3, scale: 1.15, ease: 'back.out(1.5)' });
      });
      opt.addEventListener('mouseleave', () => {
        gsap.to(opt, { duration: 0.3, scale: 1, ease: 'back.out(1.5)' });
      });
    });
  } // end !isTouch

  // 3D Tilt for cards - only on desktop (non-touch devices)
  if (typeof VanillaTilt !== 'undefined' && !isTouch) {
    VanillaTilt.init(document.querySelectorAll(".project-card, .blog-card, .skill-category"), {
      max: 12,
      speed: 600,
      perspective: 1000,
      scale: 1.025,
      glare: true,
      "max-glare": 0.15,
    });

    VanillaTilt.init(document.querySelectorAll(".contact-wrapper"), {
      max: 4,
      speed: 600,
      perspective: 1200,
      scale: 1.01,
      glare: true,
      "max-glare": 0.1,
    });

    VanillaTilt.init(document.querySelectorAll(".edu-row"), {
      max: 6,
      speed: 500,
      perspective: 1200,
      scale: 1.01,
      glare: true,
      "max-glare": 0.08,
    });
  }
}


// ─── DYNAMIC 3D STAR BACKGROUNDS GENERATOR ───
(function() {
  function generateStarShadows(count, maxX, maxY) {
    const shadows = [];
    for (let i = 0; i < count; i++) {
      const x = Math.floor(Math.random() * maxX);
      const y = Math.floor(Math.random() * maxY);
      shadows.push(`${x}px ${y}px #fff`);
    }
    return shadows.join(', ');
  }

  // Generate unique star fields on document load
  const layer1Shadows = generateStarShadows(250, 2000, 2000);
  const layer2Shadows = generateStarShadows(120, 2000, 2000);
  const layer3Shadows = generateStarShadows(60, 2000, 2000);

  const root = document.documentElement;
  root.style.setProperty('--layer-1-shadows', layer1Shadows);
  root.style.setProperty('--layer-2-shadows', layer2Shadows);
  root.style.setProperty('--layer-3-shadows', layer3Shadows);
})();
