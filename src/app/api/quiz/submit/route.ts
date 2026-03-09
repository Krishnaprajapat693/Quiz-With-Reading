import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return new Response("Unauthorized", { status: 401 })
        }

        const { topic, difficulty, score, totalQuestions, review, weakAreas, learningTips } = await req.json()

        if (!topic || !difficulty || score === undefined || !totalQuestions) {
            return new Response("Missing fields", { status: 400 })
        }

        const attempt = await prisma.quizAttempt.create({
            data: {
                userId: session.user.id,
                topic,
                difficulty,
                score,
                totalQuestions,
                review,
                weakAreas,
                learningTips
            }
        })

        return new Response(JSON.stringify(attempt), { status: 201 })
    } catch (error) {
        console.error("Quiz Submit error:", error)
        return new Response("Internal server error", { status: 500 })
    }
}
