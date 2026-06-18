import { useEffect, useRef } from 'react';
import './WineVisualization.css';

const NUM_BUBBLES = 28;
const NUM_PARTICLES = 18;

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

type BubbleConfig = {
  id: number;
  left: string;
  size: number;
  delay: string;
  duration: string;
  opacity: number;
  color: string;
};

type ParticleConfig = {
  id: number;
  left: string;
  top: string;
  size: number;
  delay: string;
  duration: string;
  color: string;
  symbol: string;
};

const BUBBLE_COLORS = [
  'rgba(247,200,115,0.55)',
  'rgba(245,230,202,0.45)',
  'rgba(232,196,114,0.5)',
  'rgba(255,255,255,0.3)',
  'rgba(197,160,40,0.4)',
];

const PARTICLE_COLORS = [
  '#7B2D3E',
  '#C5A028',
  '#8B1A2A',
  '#E8C472',
  '#5C0F1E',
  '#F5E6CA',
  '#A0324A',
  '#D4A853',
];

const SYMBOLS = ['🍇', '🍷', '✦', '❋', '◆', '✿', '❖', '•'];

const bubbles: BubbleConfig[] = Array.from({ length: NUM_BUBBLES }, (_, i) => ({
  id: i,
  left: `${randomBetween(10, 90)}%`,
  size: randomBetween(4, 14),
  delay: `${randomBetween(0, 6)}s`,
  duration: `${randomBetween(3.5, 8)}s`,
  opacity: randomBetween(0.35, 0.75),
  color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
}));

const particles: ParticleConfig[] = Array.from({ length: NUM_PARTICLES }, (_, i) => ({
  id: i,
  left: `${randomBetween(5, 95)}%`,
  top: `${randomBetween(5, 90)}%`,
  size: randomBetween(8, 22),
  delay: `${randomBetween(0, 5)}s`,
  duration: `${randomBetween(4, 9)}s`,
  color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
  symbol: SYMBOLS[i % SYMBOLS.length],
}));

const WineVisualization = () => {
  const glassRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const el = glassRef.current;
    if (!el) return;
    let frame = 0;
    let raf: number;
    const animate = () => {
      frame++;
      const wave = el.querySelector('#wine-wave') as SVGPathElement | null;
      if (wave) {
        const t = frame / 60;
        const amp = 6;
        const freq = 1.3;
        const d = `
          M 60,${148 + Math.sin(t * freq) * amp}
          Q 90,${142 + Math.sin(t * freq + 1) * amp} 120,${148 + Math.sin(t * freq + 2) * amp}
          Q 150,${154 + Math.sin(t * freq + 3) * amp} 180,${148 + Math.sin(t * freq + 1.5) * amp}
          L 180,210 Q 160,240 120,248 Q 80,240 60,210 Z
        `;
        wave.setAttribute('d', d);
      }
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="wine-viz">
      {/* Ambient background orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* Floating particles */}
      {particles.map((p) => (
        <span
          key={p.id}
          className="wine-particle"
          style={{
            left: p.left,
            top: p.top,
            fontSize: `${p.size}px`,
            color: p.color,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        >
          {p.symbol}
        </span>
      ))}

      {/* Main content */}
      <div className="wine-viz-inner">
        {/* Title */}
        <div className="wine-title-block">
          <h1 className="wine-main-title">
            <span className="wine-title-know">Know</span>
            <span className="wine-title-wine">Wine</span>
            <span className="wine-title-ai"> AI</span>
          </h1>
          <p className="wine-subtitle">Discover · Savour · Remember</p>
          <div className="wine-divider">
            <span className="divider-line" />
            <span className="divider-icon">🍷</span>
            <span className="divider-line" />
          </div>
        </div>

        {/* Glass with bubbles */}
        <div className="glass-container">
          {/* Champagne bubbles inside glass */}
          <div className="glass-bubble-zone">
            {bubbles.map((b) => (
              <span
                key={b.id}
                className="champagne-bubble"
                style={{
                  left: b.left,
                  width: `${b.size}px`,
                  height: `${b.size}px`,
                  animationDelay: b.delay,
                  animationDuration: b.duration,
                  opacity: b.opacity,
                  background: b.color,
                }}
              />
            ))}
          </div>

          {/* SVG Wine Glass */}
          <svg
            ref={glassRef}
            className="wine-glass-svg"
            viewBox="0 0 240 320"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <radialGradient id="wineGrad" cx="45%" cy="60%" r="60%">
                <stop offset="0%" stopColor="#A02040" stopOpacity="0.95" />
                <stop offset="50%" stopColor="#6B1225" stopOpacity="1" />
                <stop offset="100%" stopColor="#3D0C11" stopOpacity="1" />
              </radialGradient>
              <linearGradient id="glassGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#F5E6CA" stopOpacity="0.08" />
                <stop offset="30%" stopColor="#FFFFFF" stopOpacity="0.18" />
                <stop offset="70%" stopColor="#E8C472" stopOpacity="0.06" />
                <stop offset="100%" stopColor="#F5E6CA" stopOpacity="0.12" />
              </linearGradient>
              <linearGradient id="stemGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#F5E6CA" stopOpacity="0.12" />
                <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#F5E6CA" stopOpacity="0.08" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="wineGlow">
                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <clipPath id="glassClip">
                <path d="M 60,10 Q 50,80 60,148 Q 80,240 120,248 Q 160,240 180,148 Q 190,80 180,10 Z" />
              </clipPath>
            </defs>

            {/* Glass body outline */}
            <path
              d="M 60,10 Q 50,80 60,148 Q 80,240 120,248 Q 160,240 180,148 Q 190,80 180,10 Z"
              fill="url(#glassGrad)"
              stroke="rgba(245,230,202,0.35)"
              strokeWidth="1.5"
              filter="url(#glow)"
            />

            {/* Animated wine liquid */}
            <path
              id="wine-wave"
              d="M 60,148 Q 90,142 120,148 Q 150,154 180,148 L 180,210 Q 160,240 120,248 Q 80,240 60,210 Z"
              fill="url(#wineGrad)"
              clipPath="url(#glassClip)"
              filter="url(#wineGlow)"
            />

            {/* Wine surface shimmer */}
            <ellipse
              cx="120"
              cy="148"
              rx="30"
              ry="5"
              fill="rgba(200,80,100,0.25)"
              clipPath="url(#glassClip)"
            />

            {/* Glass highlight left */}
            <path
              d="M 68,20 Q 62,80 65,140"
              fill="none"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Glass highlight right subtle */}
            <path
              d="M 172,20 Q 178,80 175,140"
              fill="none"
              stroke="rgba(245,230,202,0.12)"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Stem */}
            <rect
              x="115"
              y="248"
              width="10"
              height="50"
              rx="3"
              fill="url(#stemGrad)"
              stroke="rgba(245,230,202,0.3)"
              strokeWidth="1"
            />

            {/* Base */}
            <ellipse
              cx="120"
              cy="300"
              rx="42"
              ry="8"
              fill="rgba(245,230,202,0.08)"
              stroke="rgba(245,230,202,0.3)"
              strokeWidth="1.2"
            />

            {/* Rim top line */}
            <line
              x1="60"
              y1="10"
              x2="180"
              y2="10"
              stroke="rgba(245,230,202,0.4)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Tagline below glass */}
        <p className="wine-tagline">Your personal wine companion</p>
      </div>
    </div>
  );
};

export default WineVisualization;
