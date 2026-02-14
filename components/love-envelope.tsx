"use client"

import { useState } from "react"
import { Heart } from "lucide-react"

export function LoveEnvelope({ onOpen }: { onOpen: () => void }) {
  const [isOpening, setIsOpening] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const handleClick = () => {
    if (isOpen) return
    setIsOpening(true)
    setTimeout(() => {
      setIsOpen(true)
      setTimeout(() => {
        onOpen()
      }, 600)
    }, 800)
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <button
        onClick={handleClick}
        className="relative group cursor-pointer focus:outline-none"
        aria-label="Open love letter"
        style={{ animation: isOpen ? "none" : "floatBob 3s ease-in-out infinite" }}
      >
        {/* Shadow underneath */}
        <div 
          className={`absolute bottom-[-20px] left-1/2 -translate-x-1/2 w-52 h-8 bg-black/25 rounded-full blur-xl transition-all duration-700 ${
            isOpen ? "opacity-0 scale-50" : "group-hover:scale-110 group-hover:opacity-35"
          }`}
        />

        {/* Envelope body */}
        <div
          className={`relative w-[70vw] max-w-[22rem] aspect-[16/11] rounded-xl transition-all duration-700 ${
            isOpen
              ? "scale-90 opacity-0 translate-y-8"
              : "hover:scale-105"
          }`}
          style={{
            background: "linear-gradient(145deg, #f0b8c4 0%, #e8a0b0 25%, #d88898 50%, #cc7088 75%, #c05878 100%)",
            boxShadow: `
              0 15px 50px rgba(180, 70, 90, 0.35),
              0 5px 20px rgba(0,0,0,0.3),
              inset 0 2px 4px rgba(255,255,255,0.4),
              inset 0 -2px 6px rgba(150, 50, 70, 0.3)
            `,
          }}
        >
          {/* Shimmer sweep overlay */}
          <div
            className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none"
            style={{ zIndex: 15 }}
          >
            <div
              className="absolute inset-0 w-[60%] h-full"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
                animation: "shimmerSweep 3s ease-in-out 1s infinite",
              }}
            />
          </div>

          {/* Paper texture overlay */}
          <div 
            className="absolute inset-0 rounded-xl opacity-15"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Envelope flap (top triangle) */}
          <div
            className={`absolute inset-x-0 top-0 h-1/2 origin-top transition-transform duration-700 ${
              isOpening ? "[transform:rotateX(180deg)]" : ""
            }`}
            style={{ perspective: "800px", transformStyle: "preserve-3d" }}
          >
            {/* Flap shadow */}
            <div className="absolute inset-0 bg-black/10" />
            
            <svg viewBox="0 0 320 104" className="w-full h-full drop-shadow-sm">
              {/* Main flap */}
              <path
                d="M0 0 L160 104 L320 0 Z"
                fill="url(#flapGradient)"
                className="transition-all duration-300 group-hover:brightness-110"
              />
              {/* Flap edge highlight */}
              <path
                d="M0 0 L160 104 L320 0"
                fill="none"
                stroke="rgba(255,255,255,0.5)"
                strokeWidth="2"
              />
              {/* Inner shadow line */}
              <path
                d="M10 10 L160 90 L310 10"
                fill="none"
                stroke="rgba(0,0,0,0.08)"
                strokeWidth="1"
              />
              <defs>
                <linearGradient id="flapGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#f5c4d0" />
                  <stop offset="40%" stopColor="#e0a0af" />
                  <stop offset="100%" stopColor="#cc7088" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Heart seal */}
          <div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 transition-all duration-500 ${
              isOpening ? "scale-150 opacity-0" : "group-hover:scale-110"
            }`}
          >
            {/* Seal outer glow */}
            <div
              className="absolute -inset-4 rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(233,69,96,0.3) 0%, transparent 70%)",
                animation: "sealGlow 2s ease-in-out infinite",
              }}
            />
            {/* Seal shadow */}
            <div className="absolute inset-0 bg-black/20 blur-md rounded-full transform translate-y-1" />
            <div
              className="bg-gradient-to-br from-rose-50 via-rose-100 to-rose-200 rounded-full p-4 shadow-2xl border-2 border-rose-300/60"
              style={{
                boxShadow: "0 4px 20px rgba(233, 69, 96, 0.3), 0 0 40px rgba(233, 69, 96, 0.15), inset 0 1px 2px rgba(255,255,255,0.8)",
              }}
            >
              <Heart className="w-10 h-10 text-rose-600 fill-rose-500 drop-shadow-[0_2px_4px_rgba(233,69,96,0.3)]" />
            </div>
          </div>

          {/* Bottom flap */}
          <svg
            viewBox="0 0 320 104"
            className="absolute bottom-0 left-0 w-full h-1/2"
          >
            {/* Bottom part */}
            <path 
              d="M0 104 L160 0 L320 104 Z" 
              fill="url(#bottomGradient)" 
            />
            {/* Edge highlight */}
            <path
              d="M0 104 L160 0 L320 104"
              fill="none"
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="1"
            />
            {/* Center fold line */}
            <path
              d="M160 0 L160 104"
              fill="none"
              stroke="rgba(0,0,0,0.08)"
              strokeWidth="1"
            />
            <defs>
              <linearGradient id="bottomGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#cc7088" />
                <stop offset="100%" stopColor="#b05068" />
              </linearGradient>
            </defs>
          </svg>

          {/* Side folds */}
          <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-black/8" />
          <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-black/8" />
        </div>
      </button>

      {!isOpen && !isOpening && (
        <p
          className="text-primary/80 font-sans text-sm tracking-[0.2em] uppercase"
          style={{ animation: "tapGlow 2s ease-in-out infinite" }}
        >
          {"✧ tap to open ✧"}
        </p>
      )}
    </div>
  )
}
