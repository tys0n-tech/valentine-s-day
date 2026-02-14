"use client"

import { useState, useEffect } from "react"
import { FloatingHearts } from "@/components/floating-hearts"
import { LoveEnvelope } from "@/components/love-envelope"
import { LoveLetter } from "@/components/love-letter"
import { SparkleBurst } from "@/components/sparkle-burst"
import { Heart } from "lucide-react"

// Generate star positions once
function generateStars(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: Math.random() * 2 + 1,
    duration: Math.random() * 4 + 2,
    delay: Math.random() * 5,
    opacity: Math.random() * 0.6 + 0.2,
  }))
}

export default function ValentinePage() {
  const [phase, setPhase] = useState<"intro" | "envelope" | "letter">("intro")
  const [showBurst, setShowBurst] = useState(false)
  const [introFade, setIntroFade] = useState(false)
  const [stars, setStars] = useState<ReturnType<typeof generateStars>>([])

  // Generate stars only on client to avoid hydration mismatch
  useEffect(() => {
    setStars(generateStars(60))
  }, [])

  useEffect(() => {
    const fadeTimer = setTimeout(() => setIntroFade(true), 500)
    const envelopeTimer = setTimeout(() => setPhase("envelope"), 3500)
    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(envelopeTimer)
    }
  }, [])

  const handleEnvelopeOpen = () => {
    setShowBurst(true)
    setTimeout(() => {
      setPhase("letter")
    }, 400)
  }

  return (
    <main className="relative min-h-screen overflow-hidden flex items-center justify-center valentine-bg">
      {/* Vignette overlay */}
      <div className="vignette" />

      {/* Starfield */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {stars.map((star) => (
          <div
            key={star.id}
            className="star-particle"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: star.size,
              height: star.size,
              opacity: star.opacity,
              ["--duration" as string]: `${star.duration}s`,
              ["--delay" as string]: `${star.delay}s`,
            }}/>
        ))}
      </div>

      {/* Ambient glow effects - enhanced with animated layers */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full opacity-15 blur-[100px]"
          style={{
            backgroundColor: "hsl(346, 77%, 55%)",
            animation: "floatBob 8s ease-in-out infinite",
          }}
        />
        <div
          className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full opacity-10 blur-[100px]"
          style={{
            backgroundColor: "hsl(20, 60%, 65%)",
            animation: "floatBob 10s ease-in-out 2s infinite",
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full opacity-8 blur-[120px]"
          style={{
            backgroundColor: "hsl(340, 60%, 45%)",
            animation: "floatBob 12s ease-in-out 4s infinite",
          }}
        />
        {/* Golden accent glow */}
        <div
          className="absolute top-1/3 right-1/3 w-[300px] h-[300px] rounded-full opacity-[0.06] blur-[80px]"
          style={{
            backgroundColor: "hsl(40, 80%, 60%)",
            animation: "floatBob 9s ease-in-out 1s infinite",
          }}
        />
      </div>

      {/* Floating hearts background */}
      <FloatingHearts />

      {/* Sparkle burst effect */}
      <SparkleBurst active={showBurst} />

      {/* Content */}
      <div className="relative z-10 w-full max-w-2xl mx-auto px-4 py-6 sm:py-12">
        {/* Phase: Intro */}
        {phase === "intro" && (
          <div
            className={`flex flex-col items-center gap-8 transition-all duration-1000 ${
              introFade ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
            }`}
          >
            <div className="relative">
              {/* Outer glow ring */}
              <div
                className="absolute -inset-6 rounded-full opacity-30 blur-xl"
                style={{
                  background: "radial-gradient(circle, hsl(346, 77%, 60%) 0%, transparent 70%)",
                  animation: "sealGlow 2s ease-in-out infinite",
                }}
              />
              <Heart className="w-20 h-20 text-primary fill-primary drop-shadow-[0_0_20px_rgba(233,69,96,0.5)]" style={{ animation: "heartbeat 1.5s ease-in-out infinite" }} />
              <div
                className="absolute inset-0 w-20 h-20 rounded-full animate-ping opacity-20"
                style={{ backgroundColor: "hsl(346, 77%, 60%)" }}
              />
            </div>
            <div className="text-center space-y-2">
              <h2 className="font-serif text-3xl md:text-4xl text-foreground/90 tracking-wide gradient-text">
                {"for you..."}
              </h2>
              <p className="text-muted-foreground text-sm tracking-[0.3em] uppercase font-sans opacity-60">
                a special message
              </p>
            </div>
          </div>
        )}

        {/* Phase: Envelope */}
        {phase === "envelope" && (
          <div className="flex flex-col items-center animate-fadeIn">
            <LoveEnvelope onOpen={handleEnvelopeOpen} />
          </div>
        )}

        {/* Phase: Love Letter */}
        {phase === "letter" && (
          <div className="animate-fadeSlideIn">
            <LoveLetter />
          </div>
        )}
      </div>

      {/* Bottom decorative hearts row */}
      <div className="fixed bottom-0 left-0 right-0 flex justify-center gap-4 pb-3 sm:pb-6 z-10 pointer-events-none">
        {Array.from({ length: 7 }).map((_, i) => (
          <Heart
            key={i}
            className="w-3 h-3 text-primary/20 fill-primary/20"
            style={{
              animation: `pulse 2.5s ease-in-out ${i * 0.25}s infinite`,
              filter: "drop-shadow(0 0 4px rgba(233, 69, 96, 0.3))",
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes heartbeat {
          0%, 100% {
            transform: scale(1);
          }
          15% {
            transform: scale(1.3);
          }
          30% {
            transform: scale(1);
          }
          45% {
            transform: scale(1.18);
          }
          60% {
            transform: scale(1);
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 0.2;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.3);
          }
        }
        :global(.animate-fadeIn) {
          animation: fadeIn 0.8s ease-out forwards;
        }
        :global(.animate-fadeSlideIn) {
          animation: fadeSlideIn 0.8s ease-out forwards;
        }
      `}</style>
    </main>
  )
}
