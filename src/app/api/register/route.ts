
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { email, password, name, role, adminId } = body

        if (!email || !password || !name) {
            return new Response(JSON.stringify({ message: "Missing required fields" }), { status: 400 })
        }

        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return new Response(JSON.stringify({ message: "User already exists" }), { status: 409 })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                role: role === "ADMIN" ? "ADMIN" : "USER",
                adminId: role === "USER" && adminId ? adminId : null
            }
        })

        const { password: _, ...userWithoutPassword } = user

        return new Response(JSON.stringify(userWithoutPassword), { status: 201, headers: { "Content-Type": "application/json" } })
    } catch (error: any) {
        console.error("==== REGISTRATION ERROR DEBUG ====");
        console.error("Error Message:", error?.message || error);
        console.error("Error Detail:", error);
        return new Response(JSON.stringify({ message: "Internal server error", detail: error?.message }), { status: 500 })
    }
}
