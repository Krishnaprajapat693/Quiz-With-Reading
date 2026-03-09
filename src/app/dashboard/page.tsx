import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import Link from "next/link"
import QuickQuiz from "@/components/quick-quiz"

function formatTime(seconds: number) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
}

export default async function DashboardPage() {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        redirect("/login")
    }

    const { role, id, name } = session.user as any

    if (role === "ADMIN") {
        // ADMIN DASHBOARD
        const managedUsers = await prisma.user.findMany({
            where: { adminId: id },
            include: {
                _count: {
                    select: { quizAttempts: true }
                }
            },
            orderBy: { createdAt: "desc" }
        })

        return (
            <div className="min-h-screen bg-background text-foreground p-8">
                <div className="max-w-6xl mx-auto space-y-8">
                    <div className="flex items-center justify-between border-b border-foreground/10 pb-6 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-3 text-ocean">
                                Admin Panel
                                <span className="text-xs font-mono px-2 py-1 bg-white/40 text-ocean rounded-md ring-1 ring-inset ring-ocean/30 select-all" title="Copy your Admin ID">ID: {id}</span>
                            </h1>
                            <p className="text-foreground/60">Welcome, {name}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard/reading" className="px-4 py-2 glass rounded-lg hover:bg-white/60 transition font-bold text-ocean flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                                Reading
                            </Link>
                            <Link href="/api/auth/signout" className="text-red-600 hover:text-red-500 px-4 py-2 glass rounded-lg hover:bg-white/60 transition font-medium">Sign Out</Link>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="p-6 rounded-2xl glass border border-white/40">
                            <div className="text-4xl font-bold text-ocean mb-2">{managedUsers.length}</div>
                            <div className="text-foreground/60 font-medium">Total Monitored Users</div>
                        </div>
                        <div className="p-6 rounded-2xl glass border border-white/40">
                            <div className="text-4xl font-bold text-ocean mb-2">
                                {formatTime(managedUsers.reduce((acc: number, u: any) => acc + u.totalTimeSpent, 0))}
                            </div>
                            <div className="text-foreground/60 font-medium">Total Combined Study Time</div>
                        </div>
                    </div>

                    <div className="glass border border-white/40 rounded-2xl overflow-hidden shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/30 text-ocean/80 text-sm border-b border-white/20">
                                    <th className="p-4 font-bold">Student Name</th>
                                    <th className="p-4 font-bold">Email</th>
                                    <th className="p-4 font-bold">Activity Time</th>
                                    <th className="p-4 font-bold">Quizzes Taken</th>
                                    <th className="p-4 font-bold">Joined</th>
                                    <th className="p-4 font-bold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/20 text-sm">
                                {managedUsers.map((u: any) => (
                                    <tr key={u.id} className="hover:bg-white/20 transition">
                                        <td className="p-4 font-bold text-foreground">{u.name || "Unknown"}</td>
                                        <td className="p-4 text-foreground/70">{u.email}</td>
                                        <td className="p-4 text-ocean font-mono font-bold">{formatTime(u.totalTimeSpent)}</td>
                                        <td className="p-4 text-foreground/70">{u._count.quizAttempts}</td>
                                        <td className="p-4 text-foreground/50">{new Date(u.createdAt).toLocaleDateString()}</td>
                                        <td className="p-4">
                                            <Link href={`/dashboard/student/${u.id}`} className="px-3 py-1.5 bg-ocean/10 text-ocean text-xs font-black uppercase tracking-widest rounded-lg border border-ocean/20 hover:bg-ocean hover:text-white transition-all">
                                                View Report
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {managedUsers.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-foreground/40">No students are currently tracked under your Admin ID. They can use your ID ({id}) when registering.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )
    }

    // USER DASHBOARD
    const user = await prisma.user.findUnique({
        where: { id },
        include: {
            quizAttempts: {
                orderBy: { createdAt: "desc" },
                take: 5
            }
        }
    })

    const topics = [
        { name: "JavaScript", icon: "⚡", description: "Core language features, ES6+, closures." },
        { name: "React", icon: "⚛️", description: "Hooks, state, Virtual DOM, components." },
        { name: "Databases (SQL)", icon: "🗄️", description: "Joins, indexes, normalization, queries." },
        { name: "Next.js", icon: "▲", description: "App router, SSR, SSG, Server Actions." }
    ]

    return (
        <div className="min-h-screen bg-background text-foreground p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between border-b border-white/20 pb-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3 text-ocean">
                            Dashboard
                            <span className="text-xs font-semibold px-2 py-1 bg-white/50 text-ocean rounded-md ring-1 ring-inset ring-ocean/20">STUDENT</span>
                        </h1>
                        <p className="text-foreground/60 mt-1">Ready to level up, {name}?</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard/reading" className="px-4 py-2 glass rounded-lg hover:bg-white/60 transition font-bold text-ocean flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                            Reading
                        </Link>
                        <Link href="/api/auth/signout" className="text-red-600 hover:text-red-500 px-4 py-2 glass rounded-lg hover:bg-white/60 transition text-sm font-bold">Sign Out</Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="p-6 rounded-2xl bg-ocean text-white shadow-lg shadow-ocean/20 border border-white/10">
                        <div className="text-4xl font-bold mb-2">{user?.quizAttempts.length || 0}</div>
                        <div className="text-white/80 font-medium">Quizzes Completed</div>
                    </div>
                    <div className="p-6 rounded-2xl glass border border-white/40">
                        <div className="text-4xl font-bold flex items-baseline gap-2 text-ocean mb-2">
                            {Math.floor((user?.totalTimeSpent || 0) / 60)} <span className="text-lg text-ocean/70">min</span>
                            {user?.totalTimeSpent! % 60} <span className="text-lg text-ocean/70">sec</span>
                        </div>
                        <div className="text-foreground/70 font-medium">Active Learning Time</div>
                    </div>
                </div>

                <QuickQuiz />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                    {topics.map(topic => (
                        <Link
                            key={topic.name}
                            href={`/quiz?topic=${encodeURIComponent(topic.name)}`}
                            className="group p-6 rounded-2xl glass hover:bg-white/60 hover:border-ocean/30 transition-all duration-300 cursor-pointer flex flex-col items-start gap-4 border border-white/40"
                        >
                            <div className="text-4xl filter drop-shadow-md group-hover:scale-110 transition-transform">{topic.icon}</div>
                            <div>
                                <h3 className="text-lg font-bold text-ocean group-hover:text-ocean/80 transition-colors">{topic.name}</h3>
                                <p className="text-sm text-foreground/60 mt-1 line-clamp-2">{topic.description}</p>
                            </div>
                        </Link>
                    ))}
                </div>

                {user?.quizAttempts && user.quizAttempts.length > 0 && (
                    <>
                        <h2 className="text-xl font-bold mb-6 text-foreground">Recent History</h2>
                        <div className="glass border border-white/40 rounded-2xl overflow-hidden shadow-sm">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-white/30 text-ocean/80 text-sm border-b border-white/20">
                                        <th className="p-4 font-bold">Topic</th>
                                        <th className="p-4 font-bold">Difficulty</th>
                                        <th className="p-4 font-bold">Score</th>
                                        <th className="p-4 font-bold">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/20 text-sm">
                                    {user.quizAttempts.map((attempt: any) => (
                                        <tr key={attempt.id} className="hover:bg-white/20 transition">
                                            <td className="p-4 font-bold text-foreground">{attempt.topic}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 text-xs font-bold rounded ${attempt.difficulty === 'Easy' ? 'bg-green-500/10 text-green-700 border border-green-500/20' :
                                                    attempt.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-700 border border-yellow-500/20' :
                                                        'bg-red-500/10 text-red-700 border border-red-500/20'
                                                    }`}>
                                                    {attempt.difficulty}
                                                </span>
                                            </td>
                                            <td className="p-4 font-mono font-bold">
                                                <span className={attempt.score / attempt.totalQuestions > 0.7 ? "text-green-600" : attempt.score / attempt.totalQuestions > 0.4 ? "text-yellow-600" : "text-red-600"}>
                                                    {attempt.score}/{attempt.totalQuestions}
                                                </span>
                                            </td>
                                            <td className="p-4 text-foreground/50">{new Date(attempt.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
