import React, { useEffect, useRef } from 'react';

const NeuralLoader = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    let animationFrameId;

    // Configuration
    const particleCount = 100;
    const connectionDistance = 120;
    const speed = 0.5;

    const resize = () => {
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    class Particle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * speed;
        this.vy = (Math.random() - 0.5) * speed;
        this.size = Math.random() * 2 + 1;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
      }

      draw() {
        ctx.fillStyle = '#00FF94'; // Sentinel Green
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const init = () => {
      resize();
      particles = [];
      const cx = width / 2;
      const cy = height / 2;
      const rx = Math.min(width, height) * 0.35; // Radius X
      const ry = Math.min(width, height) * 0.3;  // Radius Y (slightly flatter for brain shape)

      let i = 0;
      while (i < particleCount) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        
        // Ellipse Check
        const dx = x - cx;
        const dy = y - cy;
        
        if ((dx*dx)/(rx*rx) + (dy*dy)/(ry*ry) <= 1) {
            particles.push(new Particle(x, y));
            i++;
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Update and draw particles
      particles.forEach(p => {
        p.update();
        p.draw();
      });

      // Draw connections
      particles.forEach((a, i) => {
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);

          if (dist < connectionDistance) {
            ctx.strokeStyle = `rgba(0, 255, 148, ${1 - dist / connectionDistance})`; // Fading green line
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    init();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-[400px] relative bg-[#020202] border border-white/10 p-8">
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full"
      />
      
      {/* Overlay Text with Glitch Effect */}
      <div className="relative z-10 text-center">
        <h2 className="text-2xl font-bold text-white font-mono tracking-widest uppercase mb-2 animate-pulse">
          Neural Analysis Active
        </h2>
        <p className="text-sentinel-green font-mono text-xs uppercase tracking-wider">
          // Establishing Contextual Links...
        </p>
        <div className="mt-8 flex gap-1 justify-center">
            <span className="w-1 h-1 bg-sentinel-green rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-1 h-1 bg-sentinel-green rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-1 h-1 bg-sentinel-green rounded-full animate-bounce"></span>
        </div>
      </div>
    </div>
  );
};

export default NeuralLoader;
