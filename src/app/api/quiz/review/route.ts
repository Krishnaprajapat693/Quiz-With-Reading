import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { generatePerformanceReview } from "@/lib/groq"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { topic, score, total, results } = await req.json()

        if (!topic || results === undefined) {
            return NextResponse.json({ error: "Missing data" }, { status: 400 })
        }

        const review = await generatePerformanceReview(topic, score, total, results)

        return NextResponse.json(review)
    } catch (error: any) {
        console.error("Quiz Review API error:", error)
        return NextResponse.json({
            error: "Failed to generate review"
        }, { status: 500 })
    }
}
