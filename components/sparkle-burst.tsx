"use client"

import { useEffect, useState } from "react"

interface Particle {
  id: number
  x: number
  y: number
  size: number
  color: string
  angle: number
  distance: number
  duration: number
  shape: "circle" | "heart"
}

const colors = [
  "hsl(346, 77%, 60%)",
  "hsl(346, 77%, 70%)",
  "hsl(20, 60%, 70%)",
  "hsl(346, 50%, 80%)",
  "hsl(0, 0%, 95%)",
  "hsl(40, 80%, 65%)",  // gold
  "hsl(340, 60%, 55%)", // deep rose
]

export function SparkleBurst({ active }: { active: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    if (!active) return

    const newParticles: Particle[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: 50,
      y: 50,
      size: Math.random() * 10 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      angle: (Math.PI * 2 * i) / 50 + Math.random() * 0.5,
      distance: Math.random() * 45 + 20,
      duration: Math.random() * 1.2 + 0.6,
      shape: Math.random() > 0.7 ? "heart" : "circle",
    }))
    setParticles(newParticles)

    const timeout = setTimeout(() => setParticles([]), 2500)
    return () => clearTimeout(timeout)
  }, [active])

  if (!active || particles.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map((p) => {
        const endX = p.x + Math.cos(p.angle) * p.distance
        const endY = p.y + Math.sin(p.angle) * p.distance
        return (
          <div
            key={p.id}
            className="absolute"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.x}%`,
              top: `${p.y}%`,
              animation: `burstMove${p.id} ${p.duration}s ease-out forwards`,
            }}
          >
            {p.shape === "heart" ? (
              <svg viewBox="0 0 24 24" width={p.size} height={p.size} style={{ color: p.color, filter: `drop-shadow(0 0 ${p.size}px ${p.color})` }}>
                <path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            ) : (
              <div
                className="w-full h-full rounded-full"
                style={{
                  backgroundColor: p.color,
                  boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
                }}
              />
            )}
            <style jsx>{`
              @keyframes burstMove${p.id} {
                0% {
                  left: ${p.x}%;
                  top: ${p.y}%;
                  opacity: 1;
                  transform: scale(1) rotate(0deg);
                }
                60% {
                  opacity: 0.8;
                }
                100% {
                  left: ${endX}%;
                  top: ${endY}%;
                  opacity: 0;
                  transform: scale(0) rotate(${Math.random() * 360}deg);
                }
              }
            `}</style>
          </div>
        )
      })}
    </div>
  )
}
