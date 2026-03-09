"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
    const router = useRouter()
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        const formData = new FormData(e.currentTarget)
        const email = formData.get("email") as string
        const password = formData.get("password") as string

        try {
            const res = await signIn("credentials", {
                redirect: false,
                email,
                password,
            })

            if (res?.error) {
                setError("Invalid email or password")
            } else {
                router.push("/dashboard")
            }
        } catch (err) {
            setError("An unexpected error occurred.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/40 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="w-full max-w-md glass p-8 rounded-2xl shadow-xl relative z-10 animate-in fade-in zoom-in-95 duration-500">
                <div className="mb-8 text-center">
                    <Link href="/" className="inline-block p-3 rounded-xl bg-white/60 text-ocean mb-4 ring-1 ring-inset ring-ocean/20 shadow-sm transition-transform hover:scale-110">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                    </Link>
                    <h2 className="text-3xl font-extrabold text-ocean mb-2">Welcome Back</h2>
                    <p className="text-foreground/60 text-sm font-medium">Sign in to continue your learning journey.</p>
                </div>

                {error && (
                    <div className="p-3 mb-6 flex items-center gap-2 text-sm text-red-600 bg-red-600/10 border border-red-600/20 rounded-lg">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
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

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 bg-ocean hover:bg-ocean/90 text-white font-bold rounded-xl transition-all shadow-lg shadow-ocean/20 disabled:opacity-50 disabled:cursor-not-allowed mt-4 flex justify-center items-center active:scale-95"
                    >
                        {loading ? (
                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        ) : "Sign In"}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm font-medium text-foreground/60">
                    Don't have an account? <Link href="/register" className="text-ocean hover:underline font-bold">Create one</Link>
                </p>
            </div>
        </div>
    )
}
