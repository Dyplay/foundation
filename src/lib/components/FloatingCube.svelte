<!-- FloatingCube.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import * as THREE from 'three';
  import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
  import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

  let container: HTMLDivElement;
  let scene: THREE.Scene;
  let camera: THREE.PerspectiveCamera;
  let renderer: THREE.WebGLRenderer;
  let earth: THREE.Object3D;
  let earthGroup: THREE.Group;
  let frameId: number;

  const init = () => {
    // Scene setup
    scene = new THREE.Scene();
    
    // Camera setup
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 7;

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Create a group for Earth and its connections
    earthGroup = new THREE.Group();
    scene.add(earthGroup);

    // Load Earth texture
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load('/models/Earth.jpeg');
    earthTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    // Create Earth sphere with texture
    const geometry = new THREE.SphereGeometry(3.2, 64, 64);
    const material = new THREE.MeshPhysicalMaterial({
      map: earthTexture,
      metalness: 0.1,
      roughness: 0.8,
      bumpScale: 0.03,
      envMapIntensity: 1.0
    });
    earth = new THREE.Mesh(geometry, material);
    earthGroup.add(earth);

    // Add atmosphere glow
    const atmosphereGeometry = new THREE.SphereGeometry(3.35, 64, 64);
    const atmosphereMaterial = new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.BackSide,
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color(0x8B5CF6) }
      },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          gl_FragColor = vec4(color, intensity * 0.5);
        }
      `
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    earthGroup.add(atmosphere);

    // Create connectivity lines
    const connectivityPoints = [
      { lat: 40.7128, lon: -74.0060 }, // New York
      { lat: 51.5074, lon: -0.1278 },  // London
      { lat: 35.6762, lon: 139.6503 }, // Tokyo
      { lat: -33.8688, lon: 151.2093 }, // Sydney
      { lat: 22.3193, lon: 114.1694 }, // Hong Kong
      { lat: 1.3521, lon: 103.8198 },  // Singapore
      { lat: 48.8566, lon: 2.3522 },   // Paris
      { lat: -23.5505, lon: -46.6333 }, // São Paulo
    ];

    // Helper function to convert lat/lon to 3D coordinates
    const latLonToVector3 = (lat: number, lon: number, radius: number) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const z = (radius * Math.sin(phi) * Math.sin(theta));
      const y = (radius * Math.cos(phi));
      return new THREE.Vector3(x, y, z);
    };

    // Create connection lines
    const connectionGroup = new THREE.Group();
    earthGroup.add(connectionGroup);

    for (let i = 0; i < connectivityPoints.length; i++) {
      for (let j = i + 1; j < connectivityPoints.length; j++) {
        const start = connectivityPoints[i];
        const end = connectivityPoints[j];
        
        const startPos = latLonToVector3(start.lat, start.lon, 3.2);
        const endPos = latLonToVector3(end.lat, end.lon, 3.2);
        
        // Calculate the midpoint and raise it to create an arc
        const midPoint = startPos.clone().add(endPos).multiplyScalar(0.5);
        midPoint.normalize().multiplyScalar(3.8);
        
        // Create a smooth curve
        const curve = new THREE.QuadraticBezierCurve3(
          startPos,
          midPoint,
          endPos
        );
        
        // Create a tube geometry along the curve
        const tubeGeometry = new THREE.TubeGeometry(curve, 50, 0.02, 8, false);
        
        const lineMaterial = new THREE.MeshPhongMaterial({
          color: 0xA855F7,
          transparent: true,
          opacity: 0.8,
          shininess: 10
        });

        const line = new THREE.Mesh(tubeGeometry, lineMaterial);
        line.userData = { 
          progress: Math.random(),
          material: lineMaterial
        };
        connectionGroup.add(line);
      }
    }

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    // Add multiple point lights for better coverage
    const pointLight1 = new THREE.PointLight(0xffffff, 1.2);
    pointLight1.position.set(5, 3, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xffffff, 1);
    pointLight2.position.set(-5, -2, 3);
    scene.add(pointLight2);

    // Add directional light for sharp shadows and highlights
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Add hemisphere light for better environment lighting
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    // Animation loop
    const animate = () => {
      frameId = requestAnimationFrame(animate);

      // Rotate entire Earth group
      earthGroup.rotation.y += 0.001;

      // Animate connection lines opacity
      connectionGroup.children.forEach((object) => {
        const line = object as THREE.Mesh<THREE.TubeGeometry, THREE.MeshPhongMaterial>;
        line.userData.progress += 0.002;
        if (line.userData.progress > 1) {
          line.userData.progress = 0;
        }
        line.material.opacity = Math.sin(line.userData.progress * Math.PI) * 0.3 + 0.5;
      });

      // Add subtle floating animation to entire group
      earthGroup.position.y = Math.sin(Date.now() * 0.0005) * 0.1;

      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  };

  onMount(() => {
    const cleanup = init();
    return () => {
      cleanup?.();
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
      if (renderer) {
        renderer.dispose();
      }
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  });
</script>

<div class="cube-container" bind:this={container}>
  <!-- Three.js will render here -->
</div>

<style>
  .cube-container {
    width: 100%;
    height: 100%;
    min-height: 500px;
  }
</style> 