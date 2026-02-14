import { NextRequest, NextResponse } from "next/server"
import { put, list, head } from "@vercel/blob"

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
    const { messages, imageUrl, musicId, startTime, endTime } = body

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "ข้อมูลไม่ถูกต้อง" },
        { status: 400 }
      )
    }

    const shareId = generateShortId()
    const shareData = {
      messages,
      imageUrl: imageUrl || null,
      musicId: musicId || null,
      startTime: startTime || 0,
      endTime: endTime || 0,
      createdAt: new Date().toISOString(),
    }

    // Upload share data as JSON to Vercel Blob
    await put(`shares/${shareId}.json`, JSON.stringify(shareData), {
      access: "public",
      addRandomSuffix: false,
      contentType: "application/json",
    })

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
    // Find the blob
    const { blobs } = await list({ prefix: `shares/${id}.json` })

    if (blobs.length === 0) {
      return NextResponse.json(
        { error: "ไม่พบข้อมูล" },
        { status: 404 }
      )
    }

    // Fetch the JSON content from the blob URL
    const response = await fetch(blobs[0].url)
    const data = await response.json()

    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { error: "ไม่พบข้อมูล" },
      { status: 404 }
    )
  }
}
