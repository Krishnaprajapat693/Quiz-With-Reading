import { NextResponse } from "next/server";
import { generatePremiumDoc } from "@/lib/groq";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { topic } = await req.json();
        if (!topic) {
            return NextResponse.json({ error: "Topic is required" }, { status: 400 });
        }

        const documentation = await generatePremiumDoc(topic);
        return NextResponse.json({ documentation });
    } catch (error: any) {
        console.error("Documentation Generation Error:", error);
        return NextResponse.json({ error: error.message || "Failed to generate documentation" }, { status: 500 });
    }
}
