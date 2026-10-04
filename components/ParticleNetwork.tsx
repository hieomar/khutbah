'use client';

import React, { useEffect, useRef, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  color: string;
  type: 'black' | 'orange' | 'gold';
  alpha: number;
  pulseSpeed: number;
  pulseOffset: number;
  clusterIndex: number;
  orbitRadius: number;
  orbitAngle: number;
  orbitSpeed: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

export default function ParticleNetwork() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isInteractive, setIsInteractive] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = container.clientWidth);
    let height = (canvas.height = container.clientHeight);

    // Color definitions matching exact specs
    const COLOR_BLACK = '#111111';
    const COLOR_ORANGE = '#FF713F';
    const COLOR_GOLD = '#D6A82E';

    // Mouse state
    const mouse = {
      x: -1000,
      y: -1000,
      radius: 120,
      isHovered: false,
    };

    const ripples: Ripple[] = [];

    // Reduced motion check
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let prefersReducedMotion = mediaQuery.matches;
    const handleMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion = e.matches;
    };
    mediaQuery.addEventListener('change', handleMotionChange);

    // Dynamic particle sizing and count
    const isMobile = width < 768;
    const particleCount = isMobile ? 70 : 140;

    // Cluster Centers (creates the organic interconnected structure seen in Antimetal)
    const clusterCount = 5;
    const clusters: { x: number; y: number; driftX: number; driftY: number; angle: number }[] = [];
    
    for (let i = 0; i < clusterCount; i++) {
      const angle = (i / clusterCount) * Math.PI * 2;
      const dist = (Math.min(width, height) * 0.28) * (0.5 + Math.random() * 0.5);
      clusters.push({
        x: width / 2 + Math.cos(angle) * dist,
        y: height / 2 + Math.sin(angle) * dist,
        driftX: (Math.random() - 0.5) * 0.3,
        driftY: (Math.random() - 0.5) * 0.3,
        angle: Math.random() * Math.PI * 2,
      });
    }

    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const clusterIdx = Math.floor(Math.random() * clusterCount);
      const cluster = clusters[clusterIdx];

      // Assign colors based on probability: mostly black, occasional orange and gold
      const rand = Math.random();
      let type: 'black' | 'orange' | 'gold' = 'black';
      let color = COLOR_BLACK;

      if (rand < 0.12) {
        type = 'orange';
        color = COLOR_ORANGE;
      } else if (rand < 0.24) {
        type = 'gold';
        color = COLOR_GOLD;
      }

      // Particle size between 2px and 20px (a few large nodes, many subtle nodes)
      let baseRadius: number;
      if (rand < 0.08) {
        baseRadius = Math.random() * 8 + 8; // 8px - 16px larger accent nodes
      } else if (rand < 0.28) {
        baseRadius = Math.random() * 4 + 4; // 4px - 8px medium nodes
      } else {
        baseRadius = Math.random() * 2 + 1.8; // 1.8px - 3.8px small nodes
      }

      // Orbit around cluster
      const orbitRadius = Math.random() * (Math.min(width, height) * 0.24) + 10;
      const orbitAngle = Math.random() * Math.PI * 2;
      const orbitSpeed = (Math.random() * 0.004 + 0.002) * (Math.random() > 0.5 ? 1 : -1);

      const px = cluster.x + Math.cos(orbitAngle) * orbitRadius;
      const py = cluster.y + Math.sin(orbitAngle) * orbitRadius;

      particles.push({
        x: px,
        y: py,
        originX: px,
        originY: py,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: baseRadius,
        baseRadius,
        color,
        type,
        alpha: type === 'black' ? Math.random() * 0.5 + 0.4 : 0.85,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        pulseOffset: Math.random() * Math.PI * 2,
        clusterIndex: clusterIdx,
        orbitRadius,
        orbitAngle,
        orbitSpeed,
      });
    }

    // Resize handler with devicePixelRatio support for crisp rendering
    const handleResize = () => {
      if (!canvas || !container) return;
      const dpr = window.devicePixelRatio || 1;
      width = container.clientWidth;
      height = container.clientHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);

      // Re-center clusters on resize
      for (let i = 0; i < clusters.length; i++) {
        const angle = (i / clusterCount) * Math.PI * 2;
        const dist = (Math.min(width, height) * 0.28) * 0.7;
        clusters[i].x = width / 2 + Math.cos(angle) * dist;
        clusters[i].y = height / 2 + Math.sin(angle) * dist;
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Mouse interactions
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.isHovered = true;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
      mouse.isHovered = false;
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      ripples.push({
        x: clickX,
        y: clickY,
        radius: 4,
        maxRadius: Math.min(width, height) * 0.45,
        alpha: 0.6,
      });
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('click', handleClick);

    let time = 0;

    // Main animation loop
    const animate = () => {
      time += prefersReducedMotion ? 0.002 : 0.012;
      ctx.clearRect(0, 0, width, height);

      // 1. Update cluster positions gently (breathing macro structure)
      clusters.forEach((cluster, i) => {
        cluster.angle += 0.001;
        const breath = Math.sin(time * 0.5 + i) * 15;
        const baseAngle = (i / clusterCount) * Math.PI * 2 + time * 0.04;
        const dist = (Math.min(width, height) * 0.24) + breath;
        cluster.x = width / 2 + Math.cos(baseAngle) * dist;
        cluster.y = height / 2 + Math.sin(baseAngle) * dist;
      });

      // 2. Process active ripples
      for (let r = ripples.length - 1; r >= 0; r--) {
        const rip = ripples[r];
        rip.radius += 3.5;
        rip.alpha *= 0.96;

        ctx.beginPath();
        ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 113, 63, ${rip.alpha * 0.4})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        if (rip.alpha < 0.02 || rip.radius >= rip.maxRadius) {
          ripples.splice(r, 1);
        }
      }

      // 3. Update and draw particles
      particles.forEach((p) => {
        const cluster = clusters[p.clusterIndex];

        // Orbit update
        if (!prefersReducedMotion) {
          p.orbitAngle += p.orbitSpeed;
          p.radius = p.baseRadius + Math.sin(time * p.pulseSpeed * 60 + p.pulseOffset) * 0.8;
        }

        // Target position based on organic cluster orbit
        const targetX = cluster.x + Math.cos(p.orbitAngle) * p.orbitRadius;
        const targetY = cluster.y + Math.sin(p.orbitAngle) * p.orbitRadius;

        // Smooth physics towards target
        p.vx += (targetX - p.x) * 0.015;
        p.vy += (targetY - p.y) * 0.015;
        p.vx *= 0.88;
        p.vy *= 0.88;

        // Mouse attraction/repulsion
        if (mouse.isHovered) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouse.radius && dist > 0) {
            const force = (1 - dist / mouse.radius) * 3;
            // Gentle gentle repulsion from cursor
            p.vx -= (dx / dist) * force;
            p.vy -= (dy / dist) * force;
          }
        }

        // Ripple push effect
        ripples.forEach((rip) => {
          const dx = p.x - rip.x;
          const dy = p.y - rip.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const rippleDist = Math.abs(dist - rip.radius);

          if (rippleDist < 30 && dist > 0) {
            const push = (1 - rippleDist / 30) * 4 * rip.alpha;
            p.vx += (dx / dist) * push;
            p.vy += (dy / dist) * push;
          }
        });

        p.x += p.vx;
        p.y += p.vy;
      });

      // 4. Draw connecting lines between nearby particles
      const maxDistance = isMobile ? 85 : 120;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];

          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const lineAlpha = (1 - dist / maxDistance) * 0.18;

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);

            // Special line coloring if one of them is gold or orange
            if (p1.type === 'orange' || p2.type === 'orange') {
              ctx.strokeStyle = `rgba(255, 113, 63, ${lineAlpha * 1.4})`;
            } else if (p1.type === 'gold' || p2.type === 'gold') {
              ctx.strokeStyle = `rgba(214, 168, 46, ${lineAlpha * 1.4})`;
            } else {
              ctx.strokeStyle = `rgba(17, 17, 17, ${lineAlpha})`;
            }

            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      }

      // 5. Draw particles
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.5, p.radius), 0, Math.PI * 2);

        if (p.type === 'orange') {
          ctx.fillStyle = COLOR_ORANGE;
          ctx.shadowColor = 'rgba(255, 113, 63, 0.4)';
          ctx.shadowBlur = 8;
        } else if (p.type === 'gold') {
          ctx.fillStyle = COLOR_GOLD;
          ctx.shadowColor = 'rgba(214, 168, 46, 0.4)';
          ctx.shadowBlur = 8;
        } else {
          ctx.fillStyle = `rgba(17, 17, 17, ${p.alpha})`;
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
        }

        ctx.fill();
        ctx.shadowBlur = 0; // reset
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();
    setIsInteractive(true);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      mediaQuery.removeEventListener('change', handleMotionChange);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[380px] sm:h-[460px] md:h-[540px] lg:h-[600px] flex items-center justify-center select-none"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair touch-none transition-opacity duration-700"
        style={{ opacity: isInteractive ? 1 : 0 }}
        aria-label="Interactive particle visualization representing interconnected Islamic knowledge across Malawi"
      />
      
      {/* Subtle indicator caption */}
      <div className="absolute bottom-2 right-4 flex items-center gap-2 pointer-events-none opacity-40 hover:opacity-80 transition-opacity text-[11px] text-[#55554F]">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#FF713F] animate-ping" />
        <span>Live Knowledge Network • Malawi</span>
      </div>
    </div>
  );
}
