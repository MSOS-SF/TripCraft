import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/**
 * TripCraft Airplane Motion System
 * Handles the 3D model aircraft and atmospheric effects using Three.js.
 */

export class AirplaneSystem {
    constructor() {
        this.container = document.getElementById('airplane-3d-canvas');
        this.wrapper = document.querySelector('.airplane-wrapper');
        this.clouds = document.querySelectorAll('.cloud');
        
        if (!this.container) return;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, this.container.clientWidth / this.container.clientHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        
        this.airplane = null;
        this.mouse = { x: 0, y: 0 };
        this.targetRotation = { x: 0, y: 0, z: 0 };
        this.isHovering = false;
        
        this.init();
    }

    async init() {
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        this.camera.position.z = 5;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
        directionalLight.position.set(5, 10, 7);
        this.scene.add(directionalLight);

        const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
        rimLight.position.set(-5, -5, -5);
        this.scene.add(rimLight);

        // Use our custom-built G800 model as initial fallback
        this.createFallbackAirplane();
        
        // Attempt to load the external model from Google Drive
        this.loadExternalModel();

        this.animate();

        window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        window.addEventListener('scroll', () => this.handleScroll());
        window.addEventListener('resize', () => this.handleResize());
    }

    async loadExternalModel() {
        const loader = new GLTFLoader();
        const fileId = '1rPFxZE4LgzUauc9_hi0NTSSX6HXGWNJY';
        const rawUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
        
        // List of proxies to try in order
        const proxies = [
            `https://api.allorigins.win/raw?url=${encodeURIComponent(rawUrl)}`,
            `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(rawUrl)}`,
            `https://corsproxy.io/?${encodeURIComponent(rawUrl)}`,
            `https://thingproxy.freeboard.io/fetch/${rawUrl}`
        ];

        const removeLoader = () => {
            const loaderEl = this.container.querySelector('.airplane-loader');
            if (loaderEl) loaderEl.remove();
        };

        for (let i = 0; i < proxies.length; i++) {
            try {
                console.log(`Attempting to load model via proxy ${i + 1}/${proxies.length}...`);
                
                const gltf = await new Promise((resolve, reject) => {
                    loader.load(proxies[i], resolve, undefined, reject);
                });

                if (this.airplane) {
                    this.scene.remove(this.airplane);
                }
                this.airplane = gltf.scene;
                this.setupModel();
                removeLoader();
                console.log("External model loaded successfully!");
                return; // Success, exit the loop
            } catch (error) {
                console.warn(`Proxy ${i + 1} failed:`, error.message || error);
                // Continue to next proxy
            }
        }

        console.error("All proxies failed to load the model. Keeping G800 fallback.");
        removeLoader();
    }

    setupModel() {
        // Center and scale model
        const box = new THREE.Box3().setFromObject(this.airplane);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 4.5 / maxDim; // Increased from 3.2 for a larger presence
        this.airplane.scale.set(scale, scale, scale);

        const center = box.getCenter(new THREE.Vector3()).multiplyScalar(scale);
        this.airplane.position.sub(center);
        
        // Rotate to face the viewer (adjusted by 160 degrees)
        this.airplane.rotation.y = (340 * Math.PI / 180); 
        
        this.scene.add(this.airplane);
    }

    createFallbackAirplane() {
        this.airplane = new THREE.Group();

        // Materials
        const bodyMat = new THREE.MeshStandardMaterial({ 
            color: 0xffffff, 
            roughness: 0.1, 
            metalness: 0.2,
            envMapIntensity: 1.5
        });
        const darkMat = new THREE.MeshStandardMaterial({ 
            color: 0x1e293b, // Dark slate/grey for the top livery
            roughness: 0.2, 
            metalness: 0.3 
        });
        const engineMat = new THREE.MeshStandardMaterial({ 
            color: 0xffffff, 
            roughness: 0.1, 
            metalness: 0.2 
        });
        const metalMat = new THREE.MeshStandardMaterial({ 
            color: 0x94a3b8, 
            roughness: 0.2, 
            metalness: 0.8 
        });
        const winMat = new THREE.MeshStandardMaterial({ 
            color: 0x0f172a,
            roughness: 0.1,
            metalness: 0.9
        });
        const accentMat = new THREE.MeshStandardMaterial({
            color: 0x38bdf8, // Light blue accent
            emissive: 0x38bdf8,
            emissiveIntensity: 0.5
        });

        // 1. Fuselage (G800 is long and sleek)
        const fuselageGroup = new THREE.Group();
        
        // Main body
        const bodyGeom = new THREE.CylinderGeometry(0.3, 0.25, 4, 32);
        const body = new THREE.Mesh(bodyGeom, bodyMat);
        body.rotation.z = Math.PI / 2;
        fuselageGroup.add(body);

        // Top Livery (Dark section)
        const topLiveryGeom = new THREE.CylinderGeometry(0.305, 0.255, 3.8, 32, 1, false, 0, Math.PI);
        const topLivery = new THREE.Mesh(topLiveryGeom, darkMat);
        topLivery.rotation.z = Math.PI / 2;
        topLivery.rotation.x = -Math.PI / 2;
        topLivery.position.y = 0.01;
        fuselageGroup.add(topLivery);

        // Nose (Pointed)
        const noseGeom = new THREE.SphereGeometry(0.3, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2);
        const nose = new THREE.Mesh(noseGeom, bodyMat);
        nose.position.set(2, 0, 0);
        nose.rotation.z = -Math.PI / 2;
        fuselageGroup.add(nose);

        // Nose Top (Dark)
        const noseTopGeom = new THREE.SphereGeometry(0.305, 32, 32, 0, Math.PI, 0, Math.PI / 2);
        const noseTop = new THREE.Mesh(noseTopGeom, darkMat);
        noseTop.position.set(2, 0.005, 0);
        noseTop.rotation.z = -Math.PI / 2;
        noseTop.rotation.x = -Math.PI / 2;
        fuselageGroup.add(noseTop);

        // Tail Taper
        const tailTaperGeom = new THREE.ConeGeometry(0.25, 1.2, 32);
        const tailTaper = new THREE.Mesh(tailTaperGeom, bodyMat);
        tailTaper.position.set(-2.6, 0, 0);
        tailTaper.rotation.z = Math.PI / 2;
        fuselageGroup.add(tailTaper);

        this.airplane.add(fuselageGroup);

        // 2. Wings (Swept back with winglets)
        const wingShape = new THREE.Shape();
        wingShape.moveTo(0, 0);
        wingShape.lineTo(-1.8, -1.2); // Swept back
        wingShape.lineTo(-2.2, 2.5);  // Long span
        wingShape.lineTo(-0.8, 2.6);
        wingShape.lineTo(0, 0);

        const wingExtrudeSettings = { depth: 0.03, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02 };
        const wingGeom = new THREE.ExtrudeGeometry(wingShape, wingExtrudeSettings);
        
        const wingL = new THREE.Mesh(wingGeom, bodyMat);
        wingL.rotation.x = -Math.PI / 2;
        wingL.rotation.z = -0.2;
        wingL.position.set(0.2, -0.1, 0.2);
        this.airplane.add(wingL);

        // Winglet L
        const wingletGeom = new THREE.BoxGeometry(0.3, 0.6, 0.02);
        const wingletL = new THREE.Mesh(wingletGeom, bodyMat);
        wingletL.position.set(-2.1, 0.3, 2.5);
        wingletL.rotation.z = 0.4;
        wingletL.rotation.y = 0.2;
        this.airplane.add(wingletL);

        const wingR = wingL.clone();
        wingR.scale.y = -1;
        wingR.position.z = -0.2;
        this.airplane.add(wingR);

        const wingletR = wingletL.clone();
        wingletR.scale.z = -1;
        wingletR.position.z = -2.5;
        this.airplane.add(wingletR);

        // 3. T-Tail
        // Vertical Fin
        const finShape = new THREE.Shape();
        finShape.moveTo(0, 0);
        finShape.lineTo(-0.8, 0);
        finShape.lineTo(-1.2, 1.2);
        finShape.lineTo(-0.6, 1.2);
        finShape.lineTo(0, 0);

        const finGeom = new THREE.ExtrudeGeometry(finShape, wingExtrudeSettings);
        const fin = new THREE.Mesh(finGeom, bodyMat);
        fin.position.set(-1.8, 0.2, 0);
        fin.rotation.y = Math.PI / 2;
        this.airplane.add(fin);

        // Horizontal Stabilizer (Top of fin)
        const stabShape = new THREE.Shape();
        stabShape.moveTo(0, 0);
        stabShape.lineTo(-0.5, -0.4);
        stabShape.lineTo(-0.8, 1.0);
        stabShape.lineTo(-0.3, 1.0);
        stabShape.lineTo(0, 0);

        const stabGeom = new THREE.ExtrudeGeometry(stabShape, wingExtrudeSettings);
        const stabL = new THREE.Mesh(stabGeom, bodyMat);
        stabL.rotation.x = -Math.PI / 2;
        stabL.position.set(-2.6, 1.4, 0.1);
        this.airplane.add(stabL);

        const stabR = stabL.clone();
        stabR.scale.y = -1;
        stabR.position.z = -0.1;
        this.airplane.add(stabR);

        // 4. Rear-Mounted Engines
        const engineGeom = new THREE.CylinderGeometry(0.18, 0.16, 0.9, 32);
        const engineL = new THREE.Mesh(engineGeom, engineMat);
        engineL.position.set(-1.6, 0.3, 0.55);
        engineL.rotation.z = Math.PI / 2;
        this.airplane.add(engineL);

        const intakeGeom = new THREE.TorusGeometry(0.16, 0.02, 16, 32);
        const intakeL = new THREE.Mesh(intakeGeom, metalMat);
        intakeL.position.set(0.45, 0, 0);
        intakeL.rotation.y = Math.PI / 2;
        engineL.add(intakeL);

        const exhaustGeom = new THREE.SphereGeometry(0.14, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const exhaustL = new THREE.Mesh(exhaustGeom, metalMat);
        exhaustL.position.set(-0.45, 0, 0);
        exhaustL.rotation.z = -Math.PI / 2;
        engineL.add(exhaustL);

        const engineR = engineL.clone();
        engineR.position.z = -0.55;
        this.airplane.add(engineR);

        // 5. Signature Oval Windows
        const windowGeom = new THREE.CapsuleGeometry(0.04, 0.06, 4, 16);
        for (let i = 0; i < 10; i++) {
            const wL = new THREE.Mesh(windowGeom, winMat);
            wL.position.set(1.4 - i * 0.25, 0, 0.3);
            wL.rotation.x = Math.PI / 2;
            this.airplane.add(wL);
            
            const wR = wL.clone();
            wR.position.z = -0.3;
            this.airplane.add(wR);
        }

        // Cockpit Windows
        const cockpitGeom = new THREE.BoxGeometry(0.2, 0.15, 0.5);
        const cockpit = new THREE.Mesh(cockpitGeom, winMat);
        cockpit.position.set(1.6, 0.18, 0);
        cockpit.rotation.z = -0.2;
        this.airplane.add(cockpit);

        this.setupModel();
    }

    handleResize() {
        if (!this.container) return;
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }

    handleMouseMove(e) {
        this.mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
        this.mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
        
        // Make the interaction area more inclusive: 
        // If mouse is in the right 60% of the screen, the plane follows it.
        this.isHovering = e.clientX > window.innerWidth * 0.4;
    }

    handleScroll() {
        const scrolled = window.scrollY;
        const speed = scrolled * 0.1;
        
        if (this.wrapper) {
            this.wrapper.style.transform = `translateY(${speed}px) translateZ(0)`;
        }

        this.clouds.forEach((cloud, index) => {
            const cloudSpeed = (index + 1) * 0.2;
            cloud.style.transform = `translateY(${scrolled * cloudSpeed}px)`;
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        if (this.airplane) {
            const time = Date.now() * 0.001;

            if (this.isHovering) {
                // Smoothly interpolate rotations to track mouse
                this.targetRotation.y = (340 * Math.PI / 180) + this.mouse.x * 0.8;
                this.targetRotation.x = this.mouse.y * 0.5;
                this.targetRotation.z = -this.mouse.x * 0.3;
            } else {
                // Slow auto-rotation when not hovered
                this.targetRotation.y = (340 * Math.PI / 180) + Math.sin(time * 0.5) * 0.2;
                this.targetRotation.x = Math.sin(time * 0.3) * 0.1;
                this.targetRotation.z = Math.cos(time * 0.4) * 0.05;
            }

            this.airplane.rotation.y += (this.targetRotation.y - this.airplane.rotation.y) * 0.05;
            this.airplane.rotation.x += (this.targetRotation.x - this.airplane.rotation.x) * 0.05;
            this.airplane.rotation.z += (this.targetRotation.z - this.airplane.rotation.z) * 0.05;

            // Idle float
            this.airplane.position.y = Math.sin(time) * 0.1;
            
            // Shadow shift
            const shadow = document.querySelector('.airplane-shadow');
            if (shadow) {
                const shadowX = this.isHovering ? this.mouse.x * 50 : Math.sin(time * 0.5) * 20;
                const shadowY = this.isHovering ? this.mouse.y * 20 : Math.cos(time * 0.3) * 10;
                shadow.style.transform = `translateX(${shadowX}px) translateY(${shadowY}px) scale(${1 - Math.abs(this.isHovering ? this.mouse.y : 0) * 0.1})`;
            }
        }

        this.renderer.render(this.scene, this.camera);
    }

    accelerate() {
        if (!this.airplane) return;
        
        // Visual boost in Three.js
        const originalZ = this.airplane.position.z;
        const targetZ = originalZ + 1;
        
        const startTime = Date.now();
        const duration = 1000;

        const boost = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3); // Ease out cubic

            if (progress < 1) {
                this.airplane.position.z = originalZ + (targetZ - originalZ) * Math.sin(progress * Math.PI);
                requestAnimationFrame(boost);
            } else {
                this.airplane.position.z = originalZ;
            }
        };
        
        boost();
    }
}

export const initAirplane = () => new AirplaneSystem();
