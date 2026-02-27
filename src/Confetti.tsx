import { useEffect, useRef } from 'react';

interface ConfettiProps {
  emojis: string[];
  onDone: () => void;
}

const COLORS = [
  '#ff0000', '#ff6600', '#ffcc00', '#00cc00', '#0066ff',
  '#8800ff', '#ff00aa', '#00cccc', '#ff3300', '#99ff00',
];

const SHAPES = ['rect', 'circle', 'triangle'] as const;
type Shape = typeof SHAPES[number];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  shape: Shape;
  size: number;
  emoji: string | null;
  opacity: number;
}

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

function extractEmojis(emojis: string[]): string[] {
  const result: string[] = [];
  for (const str of emojis) {
    const matches = [...str.matchAll(/\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu)];
    for (const m of matches) result.push(m[0]);
  }
  return result;
}

export default function Confetti({ emojis, onDone }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const emojiChars = extractEmojis(emojis);
    const COUNT = 120;
    const particles: Particle[] = [];

    for (let i = 0; i < COUNT; i++) {
      const useEmoji = emojiChars.length > 0 && Math.random() < 0.25;
      particles.push({
        x: randomBetween(canvas.width * 0.1, canvas.width * 0.9),
        y: canvas.height + randomBetween(0, 80),
        vx: randomBetween(-5, 5),
        vy: randomBetween(-24, -8),
        rotation: randomBetween(0, Math.PI * 2),
        rotationSpeed: randomBetween(-0.15, 0.15),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
        size: randomBetween(14, 28),
        emoji: useEmoji ? emojiChars[Math.floor(Math.random() * emojiChars.length)] : null,
        opacity: 1,
      });
    }

    const GRAVITY = 0.3;
    let allGone = false;

    function drawParticle(p: Particle) {
      if (!ctx) return;
      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);

      if (p.emoji) {
        ctx.font = `${p.size * 1.6}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.emoji, 0, 0);
      } else {
        ctx.fillStyle = p.color;
        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size / 2, p.size / 3, 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.moveTo(0, -p.size / 2);
          ctx.lineTo(p.size / 2, p.size / 2);
          ctx.lineTo(-p.size / 2, p.size / 2);
          ctx.closePath();
          ctx.fill();
        }
      }
      ctx.restore();
    }

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      allGone = true;
      for (const p of particles) {
        p.vy += GRAVITY;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        if (p.y > canvas.height * 0.85) {
          p.opacity -= 0.012;
        }

        if (p.opacity > 0) {
          allGone = false;
          drawParticle(p);
        }
      }

      if (allGone) {
        onDone();
        return;
      }

      frameRef.current = requestAnimationFrame(animate);
    }

    frameRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameRef.current);
  }, [emojis, onDone]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 1000,
      }}
    />
  );
}
