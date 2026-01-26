import { writeFile, mkdir } from 'fs/promises'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ error: "No file received." }, { status: 400 })
        }

        const buffer = Buffer.from(await file.arrayBuffer())
        const filename = `${crypto.randomUUID()}${path.extname(file.name)}`

        // Ensure uploads directory exists
        const uploadDir = path.join(process.cwd(), 'public/uploads')
        try {
            await mkdir(uploadDir, { recursive: true })
        } catch (e) {
            // Ignore error if directory exists
        }

        const filePath = path.join(uploadDir, filename)
        await writeFile(filePath, buffer)

        return NextResponse.json({ url: `/uploads/${filename}` })
    } catch (error) {
        console.error("Upload Error:", error)
        return NextResponse.json({ error: "Upload failed." }, { status: 500 })
    }
}
