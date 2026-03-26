import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET() {
    try {
        const filePath = path.join(process.cwd(), "tmp", "otp.txt")
        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ error: "No OTP found" }, { status: 404 })
        }
        const otp = fs.readFileSync(filePath, "utf-8")
        return NextResponse.json({ otp })
    } catch (e) {
        return NextResponse.json({ error: "Failed to read OTP" }, { status: 500 })
    }
}
