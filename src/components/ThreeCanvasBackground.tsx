import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const ThreeCanvasBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.035);

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 24;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0x38bdf8, 0.8);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x06b6d4, 2.5);
    dirLight1.position.set(20, 20, 20);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x8b5cf6, 2.0);
    dirLight2.position.set(-20, -15, 10);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0x38bdf8, 3, 50);
    pointLight.position.set(0, 0, 10);
    scene.add(pointLight);

    // 3. Floating 3D Geometric Meshes (Icosahedrons, Torus, Dodecahedrons)
    const objectsGroup = new THREE.Group();
    scene.add(objectsGroup);

    // Main Floating Crystal (Icosahedron)
    const crystalGeo = new THREE.IcosahedronGeometry(3.2, 0);
    const crystalMat = new THREE.MeshPhysicalMaterial({
      color: 0x0ea5e9,
      emissive: 0x0369a1,
      roughness: 0.1,
      metalness: 0.85,
      clearcoat: 1.0,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });
    const mainCrystal = new THREE.Mesh(crystalGeo, crystalMat);
    mainCrystal.position.set(12, 4, -4);
    objectsGroup.add(mainCrystal);

    // Secondary Torus (Ring of Energy)
    const torusGeo = new THREE.TorusGeometry(3.8, 0.25, 16, 100);
    const torusMat = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      emissive: 0x6d28d9,
      roughness: 0.2,
      metalness: 0.9,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const torusRing = new THREE.Mesh(torusGeo, torusMat);
    torusRing.position.set(-14, -5, -2);
    objectsGroup.add(torusRing);

    // Additional floating small geometric polyhedrons
    const smallGeos = [
      new THREE.OctahedronGeometry(1.5, 0),
      new THREE.TetrahedronGeometry(1.4, 0),
      new THREE.DodecahedronGeometry(1.6, 0),
      new THREE.IcosahedronGeometry(1.2, 0),
    ];

    const smallMeshes: THREE.Mesh[] = [];
    const positions = [
      [-10, 8, -6],
      [15, -7, -5],
      [-5, -10, -8],
      [8, 10, -10],
      [-16, 2, -12],
    ];

    positions.forEach((pos, idx) => {
      const geo = smallGeos[idx % smallGeos.length];
      const mat = new THREE.MeshStandardMaterial({
        color: idx % 2 === 0 ? 0x06b6d4 : 0xa855f7,
        emissive: idx % 2 === 0 ? 0x0284c7 : 0x7e22ce,
        roughness: 0.3,
        metalness: 0.8,
        wireframe: true,
        transparent: true,
        opacity: 0.3,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(pos[0], pos[1], pos[2]);
      objectsGroup.add(mesh);
      smallMeshes.push(mesh);
    });

    // 4. Particle Field (Cyber Nebula Dust)
    const particlesCount = 350;
    const particlePositions = new Float32Array(particlesCount * 3);
    const particleColors = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 60;
      particlePositions[i + 1] = (Math.random() - 0.5) * 50;
      particlePositions[i + 2] = (Math.random() - 0.5) * 40;

      const isCyan = Math.random() > 0.5;
      particleColors[i] = isCyan ? 0.2 : 0.6;
      particleColors[i + 1] = isCyan ? 0.7 : 0.3;
      particleColors[i + 2] = isCyan ? 1.0 : 0.9;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(particlePositions, 3)
    );
    particleGeometry.setAttribute(
      'color',
      new THREE.BufferAttribute(particleColors, 3)
    );

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    // 5. Mouse Parallax & Animation Loop
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    let clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth camera parallax
      targetX += (mouseX * 3 - targetX) * 0.05;
      targetY += (-mouseY * 2 - targetY) * 0.05;
      camera.position.x = targetX;
      camera.position.y = targetY;
      camera.lookAt(scene.position);

      // Rotate objects
      mainCrystal.rotation.x = elapsedTime * 0.3;
      mainCrystal.rotation.y = elapsedTime * 0.4;

      torusRing.rotation.x = elapsedTime * 0.25;
      torusRing.rotation.y = elapsedTime * 0.35;

      smallMeshes.forEach((mesh, index) => {
        mesh.rotation.x = elapsedTime * (0.2 + index * 0.05);
        mesh.rotation.y = elapsedTime * (0.3 + index * 0.05);
        mesh.position.y += Math.sin(elapsedTime * 1.5 + index) * 0.005;
      });

      particleSystem.rotation.y = elapsedTime * 0.04;
      particleSystem.rotation.x = elapsedTime * 0.02;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      style={{
        background: 'radial-gradient(circle at 50% 20%, #091329 0%, #030712 70%, #02040a 100%)',
      }}
    />
  );
};
