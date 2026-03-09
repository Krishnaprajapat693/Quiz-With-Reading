import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { generateQuizQuestions } from "@/lib/groq"
import { prisma } from "@/lib/db"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { topic, difficulty, count } = await req.json()

        if (!topic || !difficulty) {
            return NextResponse.json({ error: "Missing topic or difficulty" }, { status: 400 })
        }

        // Try to find previous weaknesses for this topic to improve AI suggestions
        const previousAttempts = await prisma.quizAttempt.findMany({
            where: { userId: session.user.id, topic },
            orderBy: { createdAt: "desc" },
            take: 1
        })

        let weaknessesText = ""
        if (previousAttempts.length > 0 && previousAttempts[0].score < previousAttempts[0].totalQuestions * 0.7) {
            weaknessesText = `The user scored ${previousAttempts[0].score}/${previousAttempts[0].totalQuestions} last time. They need easier foundational questions mixed with challenging ones.`
        }

        const questions = await generateQuizQuestions(topic, difficulty, count || 5, weaknessesText)

        return NextResponse.json({ questions })
    } catch (error: any) {
        console.error("Quiz Generation API error Details:", {
            message: error.message,
            stack: error.stack,
            cause: error.cause
        })
        return NextResponse.json({
            error: "Failed to generate quiz due to AI error.",
            details: error.message
        }, { status: 500 })
    }
}
