import { useEffect, useRef } from "react";
import * as THREE from "three";

export function ThreeBackground({ isVoiceActive = false }: { isVoiceActive?: boolean }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    animId: number;
    mouseX: number;
    mouseY: number;
    particles: THREE.Points;
    grid: THREE.LineSegments;
    orbs: THREE.Mesh[];
    pulseRings: THREE.Mesh[];
    clock: THREE.Clock;
  } | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const mount = mountRef.current;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0, 15, 80);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const clock = new THREE.Clock();

    // Holographic grid floor
    const gridSize = 200;
    const gridDivisions = 40;
    const gridGeometry = new THREE.BufferGeometry();
    const gridVertices: number[] = [];
    const step = gridSize / gridDivisions;
    const half = gridSize / 2;
    for (let i = 0; i <= gridDivisions; i++) {
      const pos = -half + i * step;
      gridVertices.push(-half, -10, pos, half, -10, pos);
      gridVertices.push(pos, -10, -half, pos, -10, half);
    }
    gridGeometry.setAttribute("position", new THREE.Float32BufferAttribute(gridVertices, 3));
    const gridMaterial = new THREE.LineBasicMaterial({
      color: 0x00d4ff,
      transparent: true,
      opacity: 0.08,
    });
    const grid = new THREE.LineSegments(gridGeometry, gridMaterial);
    scene.add(grid);

    // Particle field — neural fog
    const particleCount = 1500;
    const positions = new Float32Array(particleCount * 3);
    const particleSizes = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 300;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 120;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
      particleSizes[i] = Math.random() * 1.5 + 0.3;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    particleGeo.setAttribute("size", new THREE.Float32BufferAttribute(particleSizes, 1));
    const particleMat = new THREE.PointsMaterial({
      color: 0x00d4ff,
      size: 0.6,
      transparent: true,
      opacity: 0.4,
      sizeAttenuation: true,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Neural network lines
    const lineCount = 60;
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x8b5cf6,
      transparent: true,
      opacity: 0.12,
    });
    for (let i = 0; i < lineCount; i++) {
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3((Math.random() - 0.5) * 200, (Math.random() - 0.5) * 60, (Math.random() - 0.5) * 150),
        new THREE.Vector3((Math.random() - 0.5) * 200, (Math.random() - 0.5) * 60, (Math.random() - 0.5) * 150),
      ]);
      scene.add(new THREE.Line(lineGeo, lineMaterial));
    }

    // Ambient floating orbs
    const orbColors = [0x00d4ff, 0x8b5cf6, 0x00ff88, 0xff6b35];
    const orbs: THREE.Mesh[] = [];
    for (let i = 0; i < 8; i++) {
      const geo = new THREE.SphereGeometry(0.8 + Math.random() * 1.5, 16, 16);
      const mat = new THREE.MeshBasicMaterial({
        color: orbColors[i % orbColors.length],
        transparent: true,
        opacity: 0.3,
      });
      const orb = new THREE.Mesh(geo, mat);
      orb.position.set(
        (Math.random() - 0.5) * 160,
        Math.random() * 40 - 10,
        (Math.random() - 0.5) * 80
      );
      scene.add(orb);
      orbs.push(orb);
    }

    // AI pulse rings on floor
    const pulseRings: THREE.Mesh[] = [];
    for (let i = 0; i < 3; i++) {
      const ringGeo = new THREE.RingGeometry(i * 12 + 5, i * 12 + 6, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x00d4ff,
        transparent: true,
        opacity: 0.06 - i * 0.015,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = -9.5;
      scene.add(ring);
      pulseRings.push(ring);
    }

    // Ambient point lights
    const light1 = new THREE.PointLight(0x00d4ff, 1.5, 120);
    light1.position.set(0, 30, 0);
    scene.add(light1);
    const light2 = new THREE.PointLight(0x8b5cf6, 1, 100);
    light2.position.set(-60, 10, -40);
    scene.add(light2);

    let mouseX = 0;
    let mouseY = 0;
    const handleMouse = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", handleMouse);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    sceneRef.current = { renderer, scene, camera, animId: 0, mouseX, mouseY, particles, grid, orbs, pulseRings, clock };

    const animate = () => {
      const id = requestAnimationFrame(animate);
      if (sceneRef.current) sceneRef.current.animId = id;
      const t = clock.getElapsedTime();

      camera.position.x += (mouseX * 8 - camera.position.x) * 0.02;
      camera.position.y += (-mouseY * 4 + 15 - camera.position.y) * 0.02;
      camera.lookAt(0, 0, 0);

      particles.rotation.y = t * 0.02;
      particles.rotation.x = Math.sin(t * 0.01) * 0.05;

      orbs.forEach((orb, i) => {
        orb.position.y += Math.sin(t * 0.5 + i * 1.2) * 0.02;
        const orbMat = orb.material as THREE.MeshBasicMaterial;
        orbMat.opacity = 0.2 + Math.sin(t * 0.8 + i) * 0.1;
      });

      pulseRings.forEach((ring, i) => {
        const scale = 1 + Math.sin(t * 1.5 - i * 0.5) * 0.05;
        ring.scale.setScalar(scale);
        const ringMat = ring.material as THREE.MeshBasicMaterial;
        ringMat.opacity = (0.06 - i * 0.015) * (0.5 + Math.sin(t * 2 + i) * 0.3);
      });

      const gridMat = grid.material as THREE.LineBasicMaterial;
      gridMat.opacity = 0.06 + Math.sin(t * 0.5) * 0.02;

      light1.intensity = 1.5 + Math.sin(t * 2) * 0.3;
      if (isVoiceActive) {
        light1.intensity = 2.5 + Math.sin(t * 8) * 1;
        light1.color.setHex(Math.sin(t * 4) > 0 ? 0x00d4ff : 0x00ff88);
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener("mousemove", handleMouse);
      window.removeEventListener("resize", handleResize);
      if (sceneRef.current) cancelAnimationFrame(sceneRef.current.animId);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    if (!sceneRef.current) return;
  }, [isVoiceActive]);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
