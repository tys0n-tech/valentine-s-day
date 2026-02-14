"use client"

import { useEffect, useState, useRef, useMemo } from "react"
import { Heart, Sparkles, Upload, X, ImageIcon, Link2, Copy, Check, Loader2, Edit2, Save, Music, Volume2, VolumeX } from "lucide-react"

const defaultMessages = [
  "วันนี้วันแห่งความรัก",
  "อยากจะบอกว่า...",
  "ขอบคุณที่อยู่ข้างกัน",
  "ขอบคุณทุกวันที่มีเธอ",
  "รักนะ ♡",
]

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: (() => void) | undefined
  }
}

// Extract YouTube video ID
const getYouTubeId = (url: string) => {
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
  return match ? match[1] : null
}

// Convert seconds to MM:SS format
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Convert MM:SS to seconds
const parseTime = (timeStr: string) => {
  const parts = timeStr.split(':')
  if (parts.length === 2) {
    return parseInt(parts[0]) * 60 + parseInt(parts[1])
  }
  return 0
}

// Generate micro particles
function generateMicroParticles(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    dx: (Math.random() - 0.5) * 40,
    dy: -(Math.random() * 30 + 10),
    size: Math.random() * 3 + 1,
    duration: Math.random() * 4 + 3,
    delay: Math.random() * 8,
    color: Math.random() > 0.5 ? "rgba(233, 69, 96, 0.4)" : "rgba(255, 180, 120, 0.3)",
  }))
}

export function LoveLetter() {
  const [visibleLines, setVisibleLines] = useState(0)
  const [showFinal, setShowFinal] = useState(false)
  const [sparkle, setSparkle] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageId, setImageId] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [isSharedView, setIsSharedView] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isEditingMessages, setIsEditingMessages] = useState(false)
  const [messages, setMessages] = useState(defaultMessages)
  const [isMuted, setIsMuted] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  
  // Music state
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [youtubeId, setYoutubeId] = useState<string | null>(null)
  const [startTime, setStartTime] = useState(0)
  const [endTime, setEndTime] = useState(0)
  const [showMusicInput, setShowMusicInput] = useState(false)
  const playerRef = useRef<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const ytApiLoadedRef = useRef(false)

  const microParticles = useMemo(() => generateMicroParticles(12), [])

  // Check for shared data on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const shareId = params.get("s")
    
    if (shareId) {
      setIsSharedView(true)
      loadShareData(shareId)
    }
  }, [])

  const loadShareData = async (shareId: string) => {
    try {
      const response = await fetch(`/api/share?id=${shareId}`)
      const data = await response.json()
      
      if (data.messages) {
        setMessages(data.messages)
      }
      if (data.imageUrl) {
        setImageUrl(data.imageUrl)
      }
      if (data.musicId) {
        setYoutubeId(data.musicId)
        if (data.startTime) setStartTime(data.startTime)
        if (data.endTime) setEndTime(data.endTime)
      }
    } catch (error) {
      console.error("Failed to load share data:", error)
    }
  }

  // Load YouTube IFrame API - audio only, hidden player
  useEffect(() => {
    if (!youtubeId) return

    const initPlayer = () => {
      if (playerRef.current) {
        playerRef.current.destroy()
        playerRef.current = null
      }

      playerRef.current = new window.YT.Player('youtube-player-hidden', {
        height: '0',
        width: '0',
        videoId: youtubeId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          start: startTime,
          end: endTime > 0 ? endTime : undefined,
        },
        events: {
          onReady: (event: any) => {
            event.target.setVolume(80)
            event.target.playVideo()
            setIsPlaying(true)
          },
          onStateChange: (event: any) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true)
            }
            // Loop the music
            if (event.data === window.YT.PlayerState.ENDED) {
              if (startTime > 0) {
                playerRef.current?.seekTo(startTime)
                playerRef.current?.playVideo()
              } else {
                playerRef.current?.seekTo(0)
                playerRef.current?.playVideo()
              }
            }
          }
        }
      })
    }

    // Check if API already loaded
    if (window.YT && window.YT.Player) {
      initPlayer()
      return
    }

    // Load API if not loaded
    if (!ytApiLoadedRef.current) {
      ytApiLoadedRef.current = true
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      const firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)
    }

    window.onYouTubeIframeAPIReady = () => {
      initPlayer()
    }
  }, [youtubeId, startTime, endTime])

  const toggleMute = () => {
    if (!playerRef.current) return
    if (isMuted) {
      playerRef.current.unMute()
      playerRef.current.setVolume(80)
    } else {
      playerRef.current.mute()
    }
    setIsMuted(!isMuted)
  }

  const loadSharedImage = async (id: string) => {
    try {
      const response = await fetch(`/api/upload?id=${id}`)
      const data = await response.json()
      if (data.url) {
        setImageUrl(data.url)
        setImageId(id)
      }
    } catch (error) {
      console.error("Failed to load shared image:", error)
    }
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setVisibleLines((prev) => {
        if (prev >= messages.length) {
          clearInterval(timer)
          setTimeout(() => setShowFinal(true), 800)
          setTimeout(() => setSparkle(true), 1500)
          return prev
        }
        return prev + 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [messages.length])

  const handleMessageChange = (index: number, value: string) => {
    const newMessages = [...messages]
    newMessages[index] = value
    setMessages(newMessages)
  }

  const generateShareUrl = async () => {
    try {
      const response = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages,
          imageUrl: imageUrl || null,
          musicId: youtubeId || null,
          startTime,
          endTime,
        }),
      })
      const data = await response.json()
      if (data.success && data.shareId) {
        const url = `${window.location.origin}?s=${data.shareId}`
        setShareUrl(url)
      }
    } catch (error) {
      console.error("Share error:", error)
    }
  }

  const handleAddMusic = () => {
    const id = getYouTubeId(youtubeUrl)
    if (id) {
      setYoutubeId(id)
      setShowMusicInput(false)
    } else {
      alert("กรุณาใส่ URL YouTube ที่ถูกต้อง")
    }
  }

  const removeMusic = () => {
    if (playerRef.current) {
      playerRef.current.destroy()
      playerRef.current = null
    }
    setYoutubeId(null)
    setYoutubeUrl("")
    setStartTime(0)
    setEndTime(0)
    setIsPlaying(false)
    setShareUrl(null)
  }

  const uploadFile = async (file: File) => {
    setIsUploading(true)
    
    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
      
      const data = await response.json()
      
      if (data.success) {
        setImageUrl(data.url)
        setImageId(data.id)
      } else {
        alert(data.error || "เกิดข้อผิดพลาดในการอัพโหลด")
      }
    } catch (error) {
      console.error("Upload error:", error)
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ: " + error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      uploadFile(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith("image/")) {
      uploadFile(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const removeImage = () => {
    setImageUrl(null)
    setImageId(null)
    setShareUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const copyShareUrl = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="flex flex-col items-center gap-8 px-4">
      {/* Hidden YouTube player for audio-only */}
      <div style={{ position: "absolute", width: 0, height: 0, overflow: "hidden", pointerEvents: "none" }}>
        <div id="youtube-player-hidden"></div>
      </div>

      {/* Floating music indicator - only show when music is playing */}
      {youtubeId && (
        <button
          onClick={toggleMute}
          className="fixed top-6 right-6 z-50 p-3 rounded-full glass-card border border-primary/20 hover:border-primary/40 transition-all group"
          title={isMuted ? "เปิดเสียง" : "ปิดเสียง"}
        >
          <div className="relative">
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-primary/60 group-hover:text-primary transition-colors" />
            ) : (
              <>
                <Volume2 className="w-5 h-5 text-primary group-hover:text-primary/80 transition-colors" />
                {/* Music playing indicator bars */}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-[2px]">
                  <div className="w-[2px] h-2 bg-primary/60 rounded-full" style={{ animation: "musicBar 0.8s ease-in-out infinite" }} />
                  <div className="w-[2px] h-2 bg-primary/60 rounded-full" style={{ animation: "musicBar 0.8s ease-in-out 0.2s infinite" }} />
                  <div className="w-[2px] h-2 bg-primary/60 rounded-full" style={{ animation: "musicBar 0.8s ease-in-out 0.4s infinite" }} />
                </div>
              </>
            )}
          </div>
        </button>
      )}

      {/* Letter card - glassmorphism */}
      <div className="relative glass-card rounded-3xl p-8 md:p-12 max-w-lg w-full">
        {/* Decorative border glow */}
        <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-br from-primary/20 via-transparent to-accent/20 -z-10 blur-sm" />

        {/* Decorative corner ornaments */}
        <div className="absolute top-3 left-3 text-primary/20">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 3v6M3 3h6M3 3l8 8" />
          </svg>
        </div>
        <div className="absolute top-3 right-3 text-primary/20">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 3v6M21 3h-6M21 3l-8 8" />
          </svg>
        </div>
        <div className="absolute bottom-3 left-3 text-primary/20">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 21v-6M3 21h6M3 21l8-8" />
          </svg>
        </div>
        <div className="absolute bottom-3 right-3 text-primary/20">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 21v-6M21 21h-6M21 21l-8-8" />
          </svg>
        </div>

        {/* Decorative sparkle corners */}
        <div className="absolute top-5 right-5 text-accent/25">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="absolute bottom-5 left-5 text-accent/25">
          <Sparkles className="w-5 h-5" />
        </div>

        {/* Micro floating particles around the card */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
          {microParticles.map((p) => (
            <div
              key={p.id}
              className="absolute rounded-full"
              style={{
                left: `${p.left}%`,
                top: `${p.top}%`,
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                animation: `microFloat ${p.duration}s ease-in-out ${p.delay}s infinite`,
                ["--dx" as string]: `${p.dx}px`,
                ["--dy" as string]: `${p.dy}px`,
              }}
            />
          ))}
        </div>

        <div className="space-y-5 min-h-[200px] relative">
          {messages.map((msg, i) => (
            <div key={i} className="relative">
              {isEditingMessages && !isSharedView ? (
                <input
                  type="text"
                  value={msg}
                  onChange={(e) => handleMessageChange(i, e.target.value)}
                  className="w-full font-serif text-lg md:text-xl leading-relaxed bg-transparent border-b-2 border-primary/30 focus:border-primary outline-none text-foreground/90 px-1 py-1"
                  style={{ fontFamily: "var(--font-noto-serif-thai), var(--font-playfair), serif" }}
                />
              ) : (
                <p
                  className={`font-serif text-lg md:text-xl leading-relaxed transition-all duration-1000 ease-out ${
                    i < visibleLines
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-8"
                  } ${
                    i === messages.length - 1
                      ? "text-primary font-bold text-2xl md:text-3xl mt-8"
                      : "text-foreground/85"
                  }`}
                  style={{
                    transitionDelay: i < visibleLines ? `${i * 100}ms` : "0ms",
                    fontFamily: "var(--font-noto-serif-thai), var(--font-playfair), serif",
                    textShadow: i === messages.length - 1 ? "0 0 20px rgba(233, 69, 96, 0.3)" : "none",
                  }}
                >
                  {msg}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Edit messages button - only for uploader */}
        {!isSharedView && (
          <div className="mt-4 flex justify-end">
            {isEditingMessages ? (
              <button
                onClick={() => {
                  setIsEditingMessages(false)
                  setShareUrl(null) // reset share URL when editing
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-rose-400 text-white text-sm rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/20"
              >
                <Save className="w-4 h-4" />
                <span>บันทึก</span>
              </button>
            ) : (
              <button
                onClick={() => setIsEditingMessages(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-primary/70 text-sm hover:text-primary transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                <span>แก้ไขข้อความ</span>
              </button>
            )}
          </div>
        )}

        {/* Music section - only show controls for uploader */}
        {!isSharedView && (
          <div className="mt-6 space-y-3">
            {!youtubeId ? (
              !showMusicInput ? (
                <button
                  onClick={() => setShowMusicInput(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3.5 border-2 border-dashed border-primary/20 rounded-2xl text-muted-foreground hover:border-primary/40 hover:bg-primary/5 transition-all group"
                >
                  <Music className="w-5 h-5 group-hover:text-primary transition-colors" />
                  <span className="group-hover:text-primary/80 transition-colors">เพิ่มเพลงจาก YouTube</span>
                </button>
              ) : (
                <div className="bg-primary/5 rounded-2xl p-4 space-y-3 border border-primary/10">
                  <div className="flex items-center gap-2 text-primary">
                    <Music className="w-4 h-4" />
                    <span className="text-sm font-medium">ใส่ลิงก์ YouTube</span>
                  </div>
                  <input
                    type="text"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full px-3 py-2.5 text-sm bg-background/50 rounded-xl border border-border/30 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground">เริ่ม (นาที:วินาที)</label>
                      <input
                        type="text"
                        value={formatTime(startTime)}
                        onChange={(e) => setStartTime(parseTime(e.target.value))}
                        placeholder="0:00"
                        className="w-full px-3 py-2 text-sm bg-background/50 rounded-xl border border-border/30 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">สิ้นสุด (นาที:วินาที)</label>
                      <input
                        type="text"
                        value={endTime > 0 ? formatTime(endTime) : ""}
                        onChange={(e) => setEndTime(parseTime(e.target.value))}
                        placeholder="ไม่กำหนด"
                        className="w-full px-3 py-2 text-sm bg-background/50 rounded-xl border border-border/30 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddMusic}
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary to-rose-400 text-white text-sm rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                    >
                      เพิ่มเพลง
                    </button>
                    <button
                      onClick={() => setShowMusicInput(false)}
                      className="px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground rounded-xl transition-colors"
                    >
                      ยกเลิก
                    </button>
                  </div>
                </div>
              )
            ) : (
              /* Music added indicator - compact, no video shown */
              <div className="bg-primary/5 rounded-2xl p-3 flex items-center gap-3 border border-primary/10">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Music className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">เพิ่มเพลงแล้ว ♪</p>
                  <p className="text-xs text-muted-foreground">
                    {formatTime(startTime)} - {endTime > 0 ? formatTime(endTime) : "จนจบ"}
                  </p>
                </div>
                <button
                  onClick={removeMusic}
                  className="p-1.5 rounded-full hover:bg-primary/10 transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Image upload section */}
        <div className="mt-6 space-y-3">
          {!imageUrl ? (
            !isSharedView && (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-500 ${
                  isDragging
                    ? "border-primary bg-primary/10 scale-[1.02]"
                    : "border-primary/20 hover:border-primary/40 hover:bg-primary/5"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-3">
                  <div className={`p-3 rounded-full transition-all duration-500 ${isDragging ? "bg-primary/20" : "bg-primary/10"}`}>
                    {isUploading ? (
                      <Loader2 className="w-6 h-6 text-primary animate-spin" />
                    ) : (
                      <Upload className={`w-6 h-6 transition-all duration-500 ${isDragging ? "text-primary scale-110" : "text-primary/60"}`} />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {isUploading ? "กำลังอัพโหลด..." : "คลิกหรือลากรูปมาใส่ได้เลย 💕"}
                  </p>
                </div>
              </div>
            )
          ) : (
            <div className="space-y-3">
              {/* Image preview */}
              <div className="relative rounded-2xl overflow-hidden group animate-fadeIn shadow-2xl">
                <img
                  src={imageUrl}
                  alt="Love memory"
                  className="w-full max-h-[70vh] object-contain rounded-2xl bg-black/20"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
                  {!isSharedView && (
                    <button
                      onClick={removeImage}
                      className="bg-white/20 hover:bg-white/30 p-3 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                  )}
                </div>
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-center gap-2">
                  <div className="bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-white/80" />
                    <span className="text-xs text-white/80">รูปความทรงจำ</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Share button & URL - only for uploader */}
        {!isSharedView && (
          <div className="mt-6 space-y-3">
            {!shareUrl ? (
              <button
                onClick={generateShareUrl}
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-gradient-to-r from-primary to-rose-400 text-white text-sm rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-primary/20 font-medium"
              >
                <Link2 className="w-5 h-5" />
                <span>สร้างลิงก์แชร์ให้แฟน</span>
              </button>
            ) : (
              <div className="bg-primary/5 rounded-2xl p-4 space-y-3 animate-fadeIn border border-primary/10">
                <div className="flex items-center gap-2 text-primary">
                  <Link2 className="w-4 h-4" />
                  <span className="text-sm font-medium">แชร์ให้แฟนดูได้เลย! 💌</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 px-3 py-2 text-sm bg-background/50 rounded-xl border border-border/30 focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-xs"
                  />
                  <button
                    onClick={copyShareUrl}
                    className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 flex items-center gap-2 shadow-lg ${
                      copied
                        ? "bg-green-500 text-white shadow-green-500/20"
                        : "bg-gradient-to-r from-primary to-rose-400 text-white hover:opacity-90 shadow-primary/20"
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>คัดลอกแล้ว!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>คัดลอก</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Signature heart */}
        <div
          className={`flex items-center justify-center mt-10 transition-all duration-1000 ${
            showFinal ? "opacity-100 scale-100" : "opacity-0 scale-50"
          }`}
        >
          <div className="relative">
            <div
              className="absolute -inset-4 rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(233,69,96,0.2) 0%, transparent 70%)",
                animation: "sealGlow 2s ease-in-out infinite",
              }}
            />
            <Heart className="w-12 h-12 text-primary fill-primary drop-shadow-[0_0_15px_rgba(233,69,96,0.4)]" style={{ animation: "heartbeat 1.5s ease-in-out infinite" }} />
          </div>
        </div>
      </div>

      {/* Big Valentine message */}
      <div
        className={`text-center transition-all duration-1000 delay-300 ${
          showFinal ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-balance leading-tight gradient-text" style={{ fontFamily: "var(--font-playfair), serif" }}>
          Happy Valentine{"'"}s Day
        </h1>
        <div
          className={`mt-5 flex items-center justify-center gap-3 transition-all duration-700 ${
            sparkle ? "opacity-100" : "opacity-0"
          }`}
        >
          <Sparkles className="w-4 h-4 text-accent animate-sparkle" />
          <p className="text-muted-foreground font-sans text-sm tracking-[0.3em] uppercase">
            {"with all my love"}
          </p>
          <Sparkles className="w-4 h-4 text-accent animate-sparkle" />
        </div>
      </div>

      <style jsx>{`
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
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes sparkle {
          0%, 100% {
            opacity: 0.5;
            transform: scale(1) rotate(0deg);
          }
          50% {
            opacity: 1;
            transform: scale(1.2) rotate(180deg);
          }
        }
        @keyframes musicBar {
          0%, 100% {
            height: 3px;
          }
          50% {
            height: 8px;
          }
        }
        :global(.animate-heartbeat) {
          animation: heartbeat 1.5s ease-in-out infinite;
        }
        :global(.animate-fadeIn) {
          animation: fadeIn 0.6s ease-out forwards;
        }
        :global(.animate-sparkle) {
          animation: sparkle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
