import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const body = await req.json()
        const { sessionId } = body

        if (sessionId) {
            // Update existing session
            const existingSession = await prisma.sessionLog.findUnique({
                where: { id: sessionId }
            })

            if (existingSession && existingSession.userId === session.user.id) {
                // Ping occurs every 15 seconds, so we add 15s to duration
                const PING_INTERVAL_SECONDS = 15;
                await prisma.$transaction([
                    prisma.sessionLog.update({
                        where: { id: sessionId },
                        data: { duration: { increment: PING_INTERVAL_SECONDS } }
                    }),
                    prisma.user.update({
                        where: { id: session.user.id },
                        data: { totalTimeSpent: { increment: PING_INTERVAL_SECONDS } }
                    })
                ])
                return NextResponse.json({ sessionId })
            }
        }

        // Create new session if no sessionId is provided or valid
        const newSession = await prisma.sessionLog.create({
            data: {
                userId: session.user.id,
                duration: 0
            }
        })

        return NextResponse.json({ sessionId: newSession.id })

    } catch (error) {
        console.error("Session PING error:", error instanceof Error ? error.message : error)
        return new NextResponse("Internal server error", { status: 500 })
    }
}
