import { NextRequest, NextResponse } from "next/server"
import { writeFile, readFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import path from "path"

// Generate a short random ID (6 chars)
function generateShortId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// POST - create a new share link
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages, imageId, musicId, startTime, endTime } = body

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "ข้อมูลไม่ถูกต้อง" },
        { status: 400 }
      )
    }

    const shareId = generateShortId()
    const shareData = {
      messages,
      imageId: imageId || null,
      musicId: musicId || null,
      startTime: startTime || 0,
      endTime: endTime || 0,
      createdAt: new Date().toISOString(),
    }

    // Create shares directory if not exists
    const sharesDir = path.join(process.cwd(), "data", "shares")
    if (!existsSync(sharesDir)) {
      await mkdir(sharesDir, { recursive: true })
    }

    // Save share data
    const filepath = path.join(sharesDir, `${shareId}.json`)
    await writeFile(filepath, JSON.stringify(shareData, null, 2))

    return NextResponse.json({
      success: true,
      shareId,
    })
  } catch (error) {
    console.error("Share error:", error)
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาด" },
      { status: 500 }
    )
  }
}

// GET - retrieve share data by ID
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json(
      { error: "กรุณาระบุ ID" },
      { status: 400 }
    )
  }

  try {
    const filepath = path.join(process.cwd(), "data", "shares", `${id}.json`)
    
    if (!existsSync(filepath)) {
      return NextResponse.json(
        { error: "ไม่พบข้อมูล" },
        { status: 404 }
      )
    }

    const data = await readFile(filepath, "utf-8")
    return NextResponse.json(JSON.parse(data))
  } catch {
    return NextResponse.json(
      { error: "ไม่พบข้อมูล" },
      { status: 404 }
    )
  }
}
