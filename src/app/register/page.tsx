"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function RegisterPage() {
    const router = useRouter()
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [msg, setMsg] = useState("")

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError("")
        setMsg("")

        const formData = new FormData(e.currentTarget)
        const email = formData.get("email") as string
        const password = formData.get("password") as string
        const name = formData.get("name") as string
        const role = formData.get("role") as string
        const adminId = formData.get("adminId") as string

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, name, role, adminId: adminId || null })
            })

            if (!res.ok) {
                const body = await res.json()
                setError(body.message || "Failed to register")
            } else {
                setMsg("Account created! Redirecting to login...")
                setTimeout(() => router.push("/login"), 1500)
            }
        } catch (err) {
            setError("An unexpected error occurred.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/40 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="w-full max-w-md glass p-8 rounded-2xl shadow-xl relative z-10 animate-in fade-in zoom-in-95 duration-500 mt-8 mb-8 border border-white/40">
                <div className="mb-8 text-center">
                    <Link href="/" className="inline-block p-3 rounded-xl bg-white/60 text-ocean mb-4 ring-1 ring-inset ring-ocean/20 shadow-sm transition-transform hover:scale-110">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                    </Link>
                    <h2 className="text-3xl font-extrabold text-ocean mb-2">Create Account</h2>
                    <p className="text-foreground/60 text-sm font-medium">Join the AI-powered learning platform.</p>
                </div>

                {error && (
                    <div className="p-3 mb-6 flex items-center gap-2 text-sm text-red-600 bg-red-600/10 border border-red-600/20 rounded-lg">
                        {error}
                    </div>
                )}
                {msg && (
                    <div className="p-3 mb-6 flex items-center gap-2 text-sm text-green-600 bg-green-600/10 border border-green-600/20 rounded-lg">
                        {msg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-foreground">Full Name</label>
                        <input
                            name="name"
                            type="text"
                            required
                            className="w-full px-4 py-3 bg-white/40 border border-white/40 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-ocean transition-all placeholder:text-foreground/30 font-medium"
                            placeholder="John Doe"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-bold text-foreground">Email Address</label>
                        <input
                            name="email"
                            type="email"
                            required
                            className="w-full px-4 py-3 bg-white/40 border border-white/40 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-ocean transition-all placeholder:text-foreground/30 font-medium"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-bold text-foreground">Password</label>
                        <input
                            name="password"
                            type="password"
                            required
                            className="w-full px-4 py-3 bg-white/40 border border-white/40 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-ocean transition-all placeholder:text-foreground/30 font-medium"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-bold text-foreground">Role</label>
                        <select
                            name="role"
                            className="w-full px-4 py-3 bg-white/40 border border-white/40 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-ocean transition-all font-medium"
                        >
                            <option value="USER" className="bg-background">Student / User</option>
                            <option value="ADMIN" className="bg-background">Administrator</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-bold text-foreground">Admin ID (Optional for students)</label>
                        <input
                            name="adminId"
                            type="text"
                            className="w-full px-4 py-3 bg-white/40 border border-white/40 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-ocean transition-all placeholder:text-foreground/30 font-medium"
                            placeholder="Admin ID if registering under one"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !!msg}
                        className="w-full py-3 px-4 bg-ocean hover:bg-ocean/90 text-white font-bold rounded-xl transition-all shadow-lg shadow-ocean/20 disabled:opacity-50 disabled:cursor-not-allowed mt-4 flex justify-center items-center active:scale-95"
                    >
                        {loading ? "Creating..." : "Create Account"}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm font-medium text-foreground/60">
                    Already have an account? <Link href="/login" className="text-ocean hover:underline font-bold">Sign in</Link>
                </p>
            </div>
        </div>
    )
}
