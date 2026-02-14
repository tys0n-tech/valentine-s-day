"use client"

import { useEffect, useState, useCallback } from "react"

interface FloatingItem {
  id: number
  x: number
  size: number
  duration: number
  delay: number
  opacity: number
  sway: number
  type: "heart" | "rose" | "sparkle" | "star"
  rotation: number
  color: string
}

const colors = [
  "hsl(346, 77%, 60%)",   // rose
  "hsl(346, 77%, 70%)",   // light rose
  "hsl(340, 60%, 55%)",   // deep pink
  "hsl(20, 60%, 70%)",    // peach
  "hsl(350, 50%, 65%)",   // soft pink
  "hsl(40, 80%, 65%)",    // gold
]

export function FloatingHearts() {
  const [items, setItems] = useState<FloatingItem[]>([])

  const createItem = useCallback((id: number): FloatingItem => {
    const types: FloatingItem["type"][] = ["heart", "heart", "heart", "rose", "sparkle", "star"]
    return {
      id,
      x: Math.random() * 100,
      size: Math.random() * 22 + 8,
      duration: Math.random() * 8 + 6,
      delay: Math.random() * 2,
      opacity: Math.random() * 0.35 + 0.08,
      sway: Math.random() * 60 - 30,
      type: types[Math.floor(Math.random() * types.length)],
      rotation: Math.random() * 360,
      color: colors[Math.floor(Math.random() * colors.length)],
    }
  }, [])

  useEffect(() => {
    const initialItems = Array.from({ length: 30 }, (_, i) => createItem(i))
    setItems(initialItems)

    let counter = 30
    const interval = setInterval(() => {
      setItems((prev) => {
        const newItems = [...prev]
        if (newItems.length > 40) {
          newItems.shift()
        }
        newItems.push(createItem(counter++))
        return newItems
      })
    }, 1200)

    return () => clearInterval(interval)
  }, [createItem])

  const renderShape = (item: FloatingItem) => {
    switch (item.type) {
      case "heart":
        return (
          <svg
            width={item.size}
            height={item.size}
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{ color: item.color }}
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        )
      case "rose":
        return (
          <span style={{ fontSize: item.size * 0.8, lineHeight: 1 }}>🌹</span>
        )
      case "sparkle":
        return (
          <svg
            width={item.size}
            height={item.size}
            viewBox="0 0 24 24"
            style={{ color: item.color }}
          >
            <path
              fill="currentColor"
              d="M12 0L14.59 8.41L23 12L14.59 15.59L12 24L9.41 15.59L1 12L9.41 8.41Z"
            />
          </svg>
        )
      case "star":
        return (
          <span style={{ fontSize: item.size * 0.7, lineHeight: 1, color: item.color }}>✦</span>
        )
    }
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {items.map((item) => (
        <div
          key={item.id}
          className="absolute bottom-0"
          style={{
            left: `${item.x}%`,
            animation: `floatUp ${item.duration}s ease-in ${item.delay}s infinite`,
          }}
        >
          <div
            style={{
              opacity: item.opacity,
              animation: `sway ${item.duration * 0.6}s ease-in-out ${item.delay}s infinite alternate, spin ${item.duration * 1.5}s linear infinite`,
              filter: `blur(${item.size > 25 ? 1.5 : 0}px) drop-shadow(0 0 ${item.size * 0.3}px ${item.color})`,
              transform: `rotate(${item.rotation}deg)`,
            }}
          >
            {renderShape(item)}
          </div>
        </div>
      ))}

      <style jsx>{`
        @keyframes floatUp {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0;
          }
          8% {
            opacity: 1;
          }
          85% {
            opacity: 1;
          }
          100% {
            transform: translateY(-110vh) rotate(20deg);
            opacity: 0;
          }
        }
        @keyframes sway {
          0% {
            transform: translateX(-25px);
          }
          100% {
            transform: translateX(25px);
          }
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}
