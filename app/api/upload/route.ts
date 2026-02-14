import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import path from "path"

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

    // Generate unique ID based on timestamp + random
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Get file extension
    const extension = file.name.split(".").pop() || "jpg"
    const filename = `${uniqueId}.${extension}`

    // Create uploads directory if not exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads")
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Save file
    const filepath = path.join(uploadsDir, filename)
    console.log("Saving file to:", filepath)
    await writeFile(filepath, buffer)
    console.log("File saved successfully")

    // Return the URL
    const imageUrl = `/uploads/${filename}`
    
    return NextResponse.json({
      success: true,
      url: imageUrl,
      id: uniqueId
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

  // Find the file with matching ID
  const uploadsDir = path.join(process.cwd(), "public", "uploads")
  
  try {
    const files = await import("fs/promises")
    const fileList = await files.readdir(uploadsDir)
    const matchingFile = fileList.find(f => f.startsWith(id))

    if (matchingFile) {
      return NextResponse.json({
        url: `/uploads/${matchingFile}`
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
