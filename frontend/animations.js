// ==========================================
// CrediSkill - 3D & GSAP Animations Engine
// ==========================================

// Global state
let introScene, introCamera, introRenderer, introObj;
let bgScene, bgCamera, bgRenderer;
let pointLight;
let particlesMesh;
let mouseX = 0, mouseY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

document.addEventListener('DOMContentLoaded', () => {
    initCursorGlow();
    
    const path = window.location.pathname;
    const isMainPage = path.includes('index.html') || path === '/' || path.endsWith('frontend/');
    const loader = document.getElementById("intro-loader");

    // Only show 3D intro on the main index page, and if we haven't shown it this session
    if (isMainPage && loader && !sessionStorage.getItem('introPlayed')) {
        loader.style.display = "flex";
        init3DIntro();
    } else if (loader) {
        // Hide loader immediately on other pages
        loader.style.display = "none";
        document.body.style.overflow = "auto";
    } else {
        document.body.style.overflow = "auto";
    }

    // Always init the background stars if canvas exists
    initBackground3D();

    // Init side bot animation
    initSideBot();

    // Init page transitions / reveal animations
    initScrollAnimations();
});

// Calculate mouse position for parallax
document.addEventListener("mousemove", (e) => {
    // Parallax update
    mouseX = (e.clientX - windowHalfX) * 0.05;
    mouseY = (e.clientY - windowHalfY) * 0.05;
        
    // Custom Cursor tracking
    const cursor = document.getElementById("custom-cursor");
    if (cursor) {
        const cursorWidth = cursor.offsetWidth || 18;
        const cursorHeight = cursor.offsetHeight || 18;
        cursor.style.left = (e.clientX - cursorWidth / 2) + "px";
        cursor.style.top = (e.clientY - cursorHeight / 2) + "px";
    }
});

function initCursorGlow() {
    const cursor = document.createElement('div');
    cursor.id = 'custom-cursor';
    document.body.appendChild(cursor);

    // Interactive hover states for pointer
    const links = document.querySelectorAll('a, button, input, select');
    links.forEach(link => {
        link.addEventListener('mouseenter', () => {
            cursor.classList.add('cursor-hover');
            gsap.to(cursor, { scale: 1.5, duration: 0.2 });
        });
        link.addEventListener('mouseleave', () => {
            cursor.classList.remove('cursor-hover');
            gsap.to(cursor, { scale: 1, duration: 0.2 });
        });
    });
}

// ================= Fullscreen 3D Intro =================
function init3DIntro() {
    const canvas = document.getElementById('bg-intro');
    if (!canvas) return;
    if (typeof THREE === 'undefined' || typeof gsap === 'undefined') {
        const loader = document.getElementById("intro-loader");
        if (loader) loader.style.display = "none";
        document.body.style.overflow = "auto";
        return;
    }

    document.body.style.overflow = 'hidden';

    introScene = new THREE.Scene();
    introCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    introRenderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    introRenderer.setSize(window.innerWidth, window.innerHeight);
    introRenderer.setPixelRatio(window.devicePixelRatio);

    // Creates an abstract neural structure / Node Network
    const geometry = new THREE.BufferGeometry();
    const particleCount = 200;
    const positions = new Float32Array(particleCount * 3);
    for(let i=0; i < particleCount * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 40;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    // Lines linking the points to form a network
    const edges = new THREE.LineBasicMaterial( { color: 0x00ffcc, transparent: true, opacity: 0.15 } );
    introObj = new THREE.LineSegments( geometry, edges );
    
    // Points at the nodes
    const pMat = new THREE.PointsMaterial({ color: 0x9d4edd, size: 0.8 });
    const pMesh = new THREE.Points(geometry, pMat);
    introObj.add(pMesh);
    
    introScene.add(introObj);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    introScene.add(ambientLight);

    pointLight = new THREE.PointLight(0x9d4edd, 2, 100);
    pointLight.position.set(20, 20, 20);
    introScene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0x00ffcc, 2, 100);
    pointLight2.position.set(-20, -20, 20);
    introScene.add(pointLight2);

    introCamera.position.z = 60;

    // Intro Animation timeline via GSAP
    const tl = gsap.timeline({
        onComplete: () => {
            introRenderer.dispose();
            const loader = document.getElementById("intro-loader");
            if (loader) {
                gsap.to(loader, {
                    opacity: 0,
                    duration: 1,
                    ease: "power2.inOut",
                    onComplete: () => {
                        loader.style.display = "none";
                        document.body.style.overflow = "auto";
                        sessionStorage.setItem('introPlayed', 'true');
                        revealMainUI();
                    }
                });
            }
        }
    });

    // Animate Text
    tl.fromTo(".logo-text", 
        { scale: 0.5, opacity: 0, letterSpacing: "10px" }, 
        { scale: 1, opacity: 1, letterSpacing: "2px", duration: 1.5, ease: "expo.out" }
    );
    
    // Animate Tagline
    tl.fromTo(".intro-tagline", 
        { y: 20, opacity: 0, textShadow: "0 0 0px #00ffcc" }, 
        { y: 0, opacity: 1, duration: 0.8, textShadow: "0 0 15px #00ffcc", ease: "power2.out" }, 
        "-=0.5"
    );

    // Zoom camera in (5 sec smooth transition)
    tl.to(introCamera.position, {
        z: 25,
        duration: 5,
        ease: "power2.inOut"
    }, "-=1.5");

    // Fade text out slightly early
    tl.to(".logo-text, .intro-tagline", {
        opacity: 0,
        scale: 1.2,
        duration: 1,
        ease: "power2.in"
    }, "-=1");

    tl.to([edges, pMat], {
        opacity: 0,
        transparent: true,
        duration: 1.5,
        ease: "power2.in"
    }, "-=1.5");

    function animateIntro() {
        if (document.getElementById("intro-loader").style.display === "none") return;
        requestAnimationFrame(animateIntro);
        
        introObj.rotation.x += 0.005;
        introObj.rotation.y += 0.01;
        
        // Gentle float
        introObj.position.y = Math.sin(Date.now() * 0.002) * 2;

        introRenderer.render(introScene, introCamera);
    }
    animateIntro();
}

// ================= Background 3D Particles =================
function initBackground3D() {
    const canvas2 = document.getElementById('bg-main');
    if (!canvas2) return;
    if (typeof THREE === 'undefined') return;

    bgScene = new THREE.Scene();
    bgCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    bgRenderer = new THREE.WebGLRenderer({ canvas: canvas2, alpha: true, antialias: true });
    bgRenderer.setSize(window.innerWidth, window.innerHeight);
    bgRenderer.setPixelRatio(window.devicePixelRatio);

    // Particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 800;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 100;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    // Create a circular particle texture procedurally
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const context = canvas.getContext('2d');
    const gradient = context.createRadialGradient(8, 8, 0, 8, 8, 8);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 16, 16);
    const map = new THREE.CanvasTexture(canvas);

    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.15,
        map: map,
        transparent: true,
        opacity: 0.8,
        color: 0x00ffcc,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    bgScene.add(particlesMesh);

    bgCamera.position.z = 15;

    function animateBackground() {
        requestAnimationFrame(animateBackground);

        // Core rotation
        particlesMesh.rotation.y -= 0.0005;
        particlesMesh.rotation.x -= 0.0002;

        // Parallax effect on mouse move
        bgCamera.position.x += (mouseX * 0.5 - bgCamera.position.x) * 0.05;
        bgCamera.position.y += (-mouseY * 0.5 - bgCamera.position.y) * 0.05;
        bgCamera.lookAt(bgScene.position);

        bgRenderer.render(bgScene, bgCamera);
    }
    animateBackground();
}

// Window resize handler
window.addEventListener('resize', () => {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    if (introCamera && introRenderer) {
        introCamera.aspect = window.innerWidth / window.innerHeight;
        introCamera.updateProjectionMatrix();
        introRenderer.setSize(window.innerWidth, window.innerHeight);
    }
    if (bgCamera && bgRenderer) {
        bgCamera.aspect = window.innerWidth / window.innerHeight;
        bgCamera.updateProjectionMatrix();
        bgRenderer.setSize(window.innerWidth, window.innerHeight);
    }
});

// ================= GSAP Scroll & Reveal Animations =================
function initScrollAnimations() {
    if (typeof gsap === 'undefined') return;
    try { gsap.registerPlugin(); } catch (e) {}
    
    // Non-main pages skip the intro timeline, so reveal immediately
    const path = window.location.pathname;
    const isMainPage = path.includes('index.html') || path === '/' || path.endsWith('frontend/');
    
    if (!isMainPage || sessionStorage.getItem('introPlayed')) {
        revealMainUI();
    }
}

function revealMainUI() {
    if (typeof gsap === 'undefined') return;

    // Header reveal
    const header = document.querySelector('header');
    if (header) {
        gsap.fromTo(header, 
            { y: -100, opacity: 0 }, 
            { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
        );
    }

    // Hero or Form Container reveal
    const elements = document.querySelectorAll('.hero, .form-container, .profile-header');
    if (elements.length > 0) {
        gsap.fromTo(elements, 
            { y: 50, opacity: 0, scale: 0.95 },
            { y: 0, opacity: 1, scale: 1, duration: 1.2, ease: "expo.out", delay: 0.2 }
        );
    }

    // Cards staggered reveal
    if (document.querySelector('.skill-grid')) {
        gsap.fromTo(".card", 
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power2.out", delay: 0.5 }
        );
    }

    // Interactive tilting for glass panels
    const panels = document.querySelectorAll('.glass-panel, .card');
    panels.forEach(panel => {
        panel.addEventListener('mousemove', (e) => {
            const rect = panel.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const tiltX = (y - centerY) / centerY;
            const tiltY = (centerX - x) / centerX;

            gsap.to(panel, {
                rotationX: tiltX * 5,
                rotationY: tiltY * 5,
                duration: 0.5,
                ease: "power1.out",
                transformPerspective: 1000,
                transformOrigin: "center center"
            });
        });

        panel.addEventListener('mouseleave', () => {
            gsap.to(panel, {
                rotationX: 0,
                rotationY: 0,
                duration: 0.5,
                ease: "power1.out"
            });
        });
    });
}

// ================= Side Floating Bot Animation =================
let botScene, botCamera, botRenderer, botObj;
function initSideBot() {
    const canvas = document.getElementById('bot-canvas');
    if (!canvas) return;
    if (typeof THREE === 'undefined') return;

    botScene = new THREE.Scene();
    botCamera = new THREE.PerspectiveCamera(45, 200 / 300, 0.1, 100);
    botRenderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    botRenderer.setSize(200, 300);
    
    // Abstract floating robot/drone shape (Octahedron inside Icosahedron)
    const geometryExt = new THREE.IcosahedronGeometry(2, 0);
    const matExt = new THREE.MeshPhysicalMaterial({
        color: 0x00ffcc, wireframe: true, transparent: true, opacity: 0.6
    });
    const meshExt = new THREE.Mesh(geometryExt, matExt);
    
    const geometryInt = new THREE.OctahedronGeometry(1.2, 0);
    const matInt = new THREE.MeshStandardMaterial({
        color: 0x9d4edd, metalness: 0.9, roughness: 0.1, emissive: 0x9d4edd, emissiveIntensity: 0.3
    });
    const meshInt = new THREE.Mesh(geometryInt, matInt);
    
    botObj = new THREE.Group();
    botObj.add(meshExt);
    botObj.add(meshInt);
    botScene.add(botObj);
    
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    botScene.add(ambient);
    const light = new THREE.PointLight(0xffffff, 1, 100);
    light.position.set(5, 5, 5);
    botScene.add(light);
    
    botCamera.position.z = 8;
    
    function animateBot() {
        requestAnimationFrame(animateBot);
        botObj.rotation.y += 0.01;
        botObj.rotation.x += 0.005;
        // Hovering effect
        botObj.position.y = Math.sin(Date.now() * 0.003) * 0.5;
        botRenderer.render(botScene, botCamera);
    }
    animateBot();
}

/* ======================================= */
/*      NAVBAR 3D GLB AVATAR SYSTEM        */
/* ======================================= */
window.initNavAvatar3D = function(forceReload) {
    const container = document.getElementById("nav-3d-avatar");
    if (!container) return;

    // If already initialized and not forced, skip
    if (container.dataset.initialized && !forceReload) return;

    // Clean up if reloading
    if (forceReload && container.dataset.initialized) {
        container.innerHTML = '';
    }
    container.dataset.initialized = 'true';

    // Ensure container has explicit dimensions
    const SIZE = 80;
    container.style.width = SIZE + 'px';
    container.style.height = SIZE + 'px';
    container.style.position = 'absolute';
    container.style.top = '0';
    container.style.left = '0';

    // THREE Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.01, 100);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(SIZE, SIZE);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputEncoding = renderer.outputEncoding; // keep default
    container.appendChild(renderer.domElement);

    // ---- Lighting setup for neon theme ----
    // Warm key light from slightly above-right
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xaaeeff, 2.5);
    keyLight.position.set(2, 4, 3);
    scene.add(keyLight);

    const neonFill = new THREE.DirectionalLight(0x9d4edd, 2.5);
    neonFill.position.set(-3, 1, 2);
    scene.add(neonFill);

    const rimLight = new THREE.DirectionalLight(0x00ffcc, 1.5);
    rimLight.position.set(0, -2, -3);
    scene.add(rimLight);

    // ---- Load GLB ----
    let model = null;
    let modelYBase = 0;

    // Use embedded base64 data URL (works over file:// with no server needed)
    // Falls back to HTTP-relative path when served normally
    const glbPath = window.AVATAR_GLB_DATA_URL || 'models/user-avatar.glb';

    const loader = new THREE.GLTFLoader();
    loader.load(
        glbPath,
        (gltf) => {
            model = gltf.scene;

            // Auto-center and auto-scale the model to fill the view
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            const modelHeight = box.max.y - box.min.y;
            const modelWidth  = box.max.x - box.min.x;
            const extent = Math.max(modelHeight, modelWidth);

            // Scale so the avatar fits snugly in the 55° FOV camera
            const fovRad = 55 * Math.PI / 180;
            const idealDist = (extent * 0.55) / Math.tan(fovRad / 2);
            camera.position.set(0, 0, idealDist);
            camera.lookAt(0, 0, 0);

            // Center model at origin
            model.position.sub(center);
            // Raise slightly to show bust/head area more
            model.position.y += modelHeight * 0.15;
            modelYBase = model.position.y;

            // Boost emissive on neon-coloured parts for glow
            model.traverse((child) => {
                if (child.isMesh && child.material) {
                    const col = child.material.color;
                    if (col) {
                        // Cyan-ish parts → emissive glow
                        if (col.r < 0.3 && col.g > 0.6 && col.b > 0.6) {
                            child.material.emissive = new THREE.Color(0x00ffcc);
                            child.material.emissiveIntensity = 0.6;
                        }
                        // Purple-ish parts → emissive glow
                        if (col.r > 0.4 && col.g < 0.3 && col.b > 0.6) {
                            child.material.emissive = new THREE.Color(0x9d4edd);
                            child.material.emissiveIntensity = 0.5;
                        }
                    }
                    child.material.needsUpdate = true;
                }
            });

            scene.add(model);
        },
        undefined,
        (error) => {
            console.warn('[Avatar] GLB load failed → geometric fallback', error);

            // Neon wireframe icosahedron as stylish fallback
            const group = new THREE.Group();

            const geo1 = new THREE.IcosahedronGeometry(0.55, 1);
            const mat1 = new THREE.MeshStandardMaterial({
                color: 0x00ffcc, wireframe: true,
                emissive: 0x00ffcc, emissiveIntensity: 0.8
            });
            group.add(new THREE.Mesh(geo1, mat1));

            const geo2 = new THREE.OctahedronGeometry(0.35, 0);
            const mat2 = new THREE.MeshStandardMaterial({
                color: 0x9d4edd, metalness: 0.9, roughness: 0.1,
                emissive: 0x9d4edd, emissiveIntensity: 0.6
            });
            group.add(new THREE.Mesh(geo2, mat2));

            model = group;
            modelYBase = 0;
            camera.position.set(0, 0, 2.2);
            camera.lookAt(0, 0, 0);
            scene.add(model);
        }
    );

    // ---- Hover interaction ----
    let isHovered = false;
    const wrapper = container.parentElement;
    if (wrapper) {
        wrapper.addEventListener('mouseenter', () => {
            isHovered = true;
            if (typeof gsap !== 'undefined') {
                gsap.to(keyLight, { intensity: 4.0, duration: 0.3 });
                gsap.to(neonFill, { intensity: 4.0, duration: 0.3 });
                gsap.to(rimLight, { intensity: 3.0, duration: 0.3 });
                gsap.to(ambientLight, { intensity: 2.0, duration: 0.3 });
            }
        });
        wrapper.addEventListener('mouseleave', () => {
            isHovered = false;
            if (typeof gsap !== 'undefined') {
                gsap.to(keyLight, { intensity: 2.5, duration: 0.3 });
                gsap.to(neonFill, { intensity: 2.5, duration: 0.3 });
                gsap.to(rimLight, { intensity: 1.5, duration: 0.3 });
                gsap.to(ambientLight, { intensity: 1.2, duration: 0.3 });
            }
        });
    }

    // ---- Render loop ----
    const clock = new THREE.Clock();
    let animRunning = true;
    function avatarAnimate() {
        if (!animRunning) return;
        requestAnimationFrame(avatarAnimate);
        const time = clock.getElapsedTime();

        if (model) {
            // Idle: slow Y-axis rotation + gentle float
            model.rotation.y = isHovered
                ? model.rotation.y + 0.045  // faster on hover
                : model.rotation.y + 0.010; // slow idle

            // Subtle floating on Y
            const floatAmp  = isHovered ? 0.08 : 0.04;
            const floatFreq = isHovered ? 2.5  : 1.2;
            model.position.y = modelYBase + Math.sin(time * floatFreq) * floatAmp;

            // Scale zoom on hover (if GSAP not handling it)
            const targetScale = isHovered ? 1.12 : 1.0;
            model.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.08);
        }

        renderer.render(scene, camera);
    }
    avatarAnimate();
};
