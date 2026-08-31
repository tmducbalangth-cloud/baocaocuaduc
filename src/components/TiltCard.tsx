import React, { useRef, useState } from 'react';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  glowColor?: 'cyan' | 'purple' | 'emerald' | 'amber' | 'default';
  onClick?: () => void;
  id?: string;
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className = '',
  maxTilt = 10,
  glowColor = 'default',
  onClick,
  id,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width; // 0 to 1
    const y = (e.clientY - rect.top) / rect.height; // 0 to 1

    const tiltX = (0.5 - y) * maxTilt;
    const tiltY = (x - 0.5) * maxTilt;

    setTilt({ x: tiltX, y: tiltY });
    setGlare({ x: x * 100, y: y * 100, opacity: 0.25 });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
    setGlare({ x: 50, y: 50, opacity: 0 });
  };

  const glowBorderMap = {
    default: 'hover:border-cyan-500/40 hover:shadow-cyan-500/20',
    cyan: 'hover:border-cyan-400/60 hover:shadow-cyan-500/30',
    purple: 'hover:border-purple-400/60 hover:shadow-purple-500/30',
    emerald: 'hover:border-emerald-400/60 hover:shadow-emerald-500/30',
    amber: 'hover:border-amber-400/60 hover:shadow-amber-500/30',
  };

  return (
    <div
      id={id}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(${isHovered ? 1.015 : 1}, ${isHovered ? 1.015 : 1}, 1)`,
        transition: isHovered ? 'transform 0.08s ease-out' : 'transform 0.5s ease-out',
      }}
      className={`relative rounded-2xl border border-slate-800/80 bg-slate-900/70 backdrop-blur-xl shadow-2xl transition-all duration-300 transform-style-3d ${glowBorderMap[glowColor]} ${className}`}
    >
      {/* Dynamic Specular Light Reflection / Glare */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl overflow-hidden transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, ${glare.opacity}), transparent 60%)`,
        }}
      />

      {/* Subtle Top Border Highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

      {children}
    </div>
  );
};
