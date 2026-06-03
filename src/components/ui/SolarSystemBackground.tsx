import { useEffect, useRef } from "react";

interface Node {
  name: string;
  color: string;
  radius: number;
  size: number;
  speed: number;
  angle: number;
  pulseScale: number;
  pulseDir: number;
  moons: { angle: number; speed: number; radius: number; size: number }[];
}

export function SolarSystemBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, active: false, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    // Track resizing
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", handleResize);

    // Track mouse on window to work with overlapping z-10 HTML elements
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Only active if mouse is within canvas bounds
      if (x >= 0 && x <= width && y >= 0 && y <= height) {
        mouseRef.current.targetX = x;
        mouseRef.current.targetY = y;
        mouseRef.current.active = true;
      } else {
        mouseRef.current.active = false;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Cosmic Objects config
    const nodes: Node[] = [
      {
        name: "Google Ads",
        color: "rgba(66, 133, 244, 0.8)", // Google Blue
        radius: 130,
        size: 7,
        speed: 0.006,
        angle: Math.random() * Math.PI * 2,
        pulseScale: 1,
        pulseDir: 0.01,
        moons: [
          { angle: 0, speed: 0.03, radius: 15, size: 2 },
          { angle: Math.PI, speed: 0.02, radius: 22, size: 1.5 },
        ],
      },
      {
        name: "Meta",
        color: "rgba(24, 119, 242, 0.8)", // Meta Blue
        radius: 200,
        size: 8,
        speed: 0.004,
        angle: Math.random() * Math.PI * 2,
        pulseScale: 1,
        pulseDir: 0.008,
        moons: [{ angle: 0, speed: 0.025, radius: 18, size: 2.5 }],
      },
      {
        name: "TikTok",
        color: "rgba(254, 44, 85, 0.8)", // TikTok Red/Pink
        radius: 270,
        size: 7.5,
        speed: 0.003,
        angle: Math.random() * Math.PI * 2,
        pulseScale: 1,
        pulseDir: 0.012,
        moons: [
          { angle: 0, speed: 0.04, radius: 14, size: 2 },
          { angle: Math.PI / 2, speed: 0.015, radius: 25, size: 1.8 },
        ],
      },
      {
        name: "LinkedIn",
        color: "rgba(10, 102, 194, 0.8)", // LinkedIn Cyan/Blue
        radius: 340,
        size: 6.5,
        speed: 0.002,
        angle: Math.random() * Math.PI * 2,
        pulseScale: 1,
        pulseDir: 0.006,
        moons: [],
      },
      {
        name: "X.com",
        color: "rgba(255, 255, 255, 0.8)", // White
        radius: 410,
        size: 5,
        speed: 0.0015,
        angle: Math.random() * Math.PI * 2,
        pulseScale: 1,
        pulseDir: 0.005,
        moons: [{ angle: Math.PI * 0.7, speed: 0.03, radius: 12, size: 1.5 }],
      },
    ];

    // Starfield config
    const stars = Array.from({ length: 60 }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 1.5 + 0.5,
      alpha: Math.random(),
      speed: Math.random() * 0.008 + 0.002,
    }));

    // Animation Loop
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse follow
      const mouse = mouseRef.current;
      mouse.x += (mouse.targetX - mouse.x) * 0.1;
      mouse.y += (mouse.targetY - mouse.y) * 0.1;

      // Cosmic center (usually center of the hero section)
      const centerX = width / 2;
      const centerY = height * 0.45; // slightly higher than middle for Hero layout alignment

      // 1. Draw Starfield
      stars.forEach((star) => {
        star.alpha += star.speed;
        if (star.alpha > 1 || star.alpha < 0) {
          star.speed = -star.speed;
        }
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, star.alpha * 0.4)})`;
        ctx.beginPath();
        ctx.arc(star.x * width, star.y * height, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // 2. Draw Orbit Rings (faint glowing circles)
      nodes.forEach((node) => {
        ctx.strokeStyle = "rgba(99, 102, 241, 0.035)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(centerX, centerY, node.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Subtly warp/highlight orbit under mouse hover
        if (mouse.active) {
          const dx = mouse.x - centerX;
          const dy = mouse.y - centerY;
          const mouseDist = Math.sqrt(dx * dx + dy * dy);
          
          if (Math.abs(mouseDist - node.radius) < 30) {
            ctx.strokeStyle = "rgba(139, 92, 246, 0.12)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(centerX, centerY, node.radius, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
      });

      // 3. Draw central "Core Sun" (AdPulse AI Hub)
      const pulsePeriod = Date.now() * 0.0015;
      const corePulse = Math.sin(pulsePeriod) * 3 + 28;
      
      const coreGrad = ctx.createRadialGradient(centerX, centerY, 2, centerX, centerY, corePulse);
      coreGrad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
      coreGrad.addColorStop(0.2, "rgba(99, 102, 241, 0.8)");
      coreGrad.addColorStop(0.5, "rgba(139, 92, 246, 0.3)");
      coreGrad.addColorStop(1, "rgba(99, 102, 241, 0)");

      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, corePulse, 0, Math.PI * 2);
      ctx.fill();

      // Outer rings of Core
      ctx.strokeStyle = "rgba(99, 102, 241, 0.15)";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.arc(centerX, centerY, corePulse + 10, 0, Math.PI * 2);
      ctx.stroke();

      // 4. Update and Draw Nodes
      nodes.forEach((node) => {
        // Increment angle
        node.angle += node.speed;
        if (node.angle > Math.PI * 2) node.angle -= Math.PI * 2;

        // Pulse effect
        node.pulseScale += node.pulseDir;
        if (node.pulseScale > 1.25 || node.pulseScale < 0.9) {
          node.pulseDir = -node.pulseDir;
        }

        // Coordinates
        const nodeX = centerX + Math.cos(node.angle) * node.radius;
        const nodeY = centerY + Math.sin(node.angle) * node.radius;

        // Hover checking
        let isHovered = false;
        if (mouse.active) {
          const dx = mouse.x - nodeX;
          const dy = mouse.y - nodeY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 35) {
            isHovered = true;
            // Draw connection line to mouse
            ctx.strokeStyle = `rgba(255, 255, 255, ${Math.max(0.05, 0.3 - dist / 120)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(nodeX, nodeY);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();

            // Hover tooltip label
            ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
            ctx.font = "500 10px Outfit, system-ui, sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(node.name, nodeX, nodeY - 14);
          }
        }

        // Draw connections back to Core (Faint stream data lines)
        ctx.strokeStyle = isHovered ? "rgba(99, 102, 241, 0.15)" : "rgba(99, 102, 241, 0.04)";
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(nodeX, nodeY);
        ctx.stroke();

        // Node Glow Ring
        const glowRadius = node.size * (isHovered ? 2.5 : 1.8) * node.pulseScale;
        const nodeGrad = ctx.createRadialGradient(nodeX, nodeY, 1, nodeX, nodeY, glowRadius);
        nodeGrad.addColorStop(0, "rgba(255, 255, 255, 1)");
        nodeGrad.addColorStop(0.3, node.color);
        nodeGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = nodeGrad;
        ctx.beginPath();
        ctx.arc(nodeX, nodeY, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Main Node core point
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(nodeX, nodeY, node.size * 0.45, 0, Math.PI * 2);
        ctx.fill();

        // Draw Moons (campaign budget packets)
        node.moons.forEach((moon) => {
          moon.angle += moon.speed;
          const moonX = nodeX + Math.cos(moon.angle) * moon.radius;
          const moonY = nodeY + Math.sin(moon.angle) * moon.radius;

          ctx.fillStyle = node.color;
          ctx.beginPath();
          ctx.arc(moonX, moonY, moon.size, 0, Math.PI * 2);
          ctx.fill();

          // Connect moon with a very faint line
          ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
          ctx.beginPath();
          ctx.arc(nodeX, nodeY, moon.radius, 0, Math.PI * 2);
          ctx.stroke();
        });
      });

      // 5. Draw mouse glow overlay if active
      if (mouse.active) {
        const mouseGrad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 100);
        mouseGrad.addColorStop(0, "rgba(99, 102, 241, 0.05)");
        mouseGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = mouseGrad;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 100, 0, Math.PI * 2);
        ctx.fill();
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-auto select-none opacity-80"
      style={{ zIndex: 0 }}
    />
  );
}
