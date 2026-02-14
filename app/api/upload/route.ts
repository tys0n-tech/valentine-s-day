import { NextRequest, NextResponse } from "next/server"
import { put, list } from "@vercel/blob"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json(
        { error: "ไม่พบไฟล์" },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "กรุณาอัพโหลดไฟล์รูปภาพเท่านั้น" },
        { status: 400 }
      )
    }

    // Validate file size (max 15MB)
    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json(
        { error: "ขนาดไฟล์ใหญ่เกินไป (สูงสุด 15MB)" },
        { status: 400 }
      )
    }

    // Generate unique ID
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    const extension = file.name.split(".").pop() || "jpg"
    const filename = `uploads/${uniqueId}.${extension}`

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
      addRandomSuffix: false,
    })

    return NextResponse.json({
      success: true,
      url: blob.url,
      id: uniqueId,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการอัพโหลด" },
      { status: 500 }
    )
  }
}

// GET method to retrieve image by ID
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
    // List blobs with the prefix to find the matching file
    const { blobs } = await list({ prefix: `uploads/${id}` })

    if (blobs.length > 0) {
      return NextResponse.json({
        url: blobs[0].url,
      })
    }

    return NextResponse.json(
      { error: "ไม่พบรูปภาพ" },
      { status: 404 }
    )
  } catch {
    return NextResponse.json(
      { error: "ไม่พบรูปภาพ" },
      { status: 404 }
    )
  }
}
