import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import { BrainCircuit, Target, LineChart, BookOpen, Clock, ChevronLeft } from "lucide-react"

function formatTime(seconds: number) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
}

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== "ADMIN") {
        redirect("/dashboard")
    }

    const student = await prisma.user.findUnique({
        where: { id: id },
        include: {
            quizAttempts: {
                orderBy: { createdAt: "desc" }
            }
        }
    })

    if (!student || student.adminId !== session.user.id) {
        return (
            <div className="min-h-screen bg-background p-8 flex items-center justify-center">
                <div className="glass p-10 rounded-3xl text-center max-w-md border border-white/40 shadow-xl">
                    <h2 className="text-2xl font-bold text-ocean mb-4">Student Not Found</h2>
                    <p className="text-foreground/60 mb-8">This student either doesn't exist or isn't under your supervision.</p>
                    <Link href="/dashboard" className="px-6 py-3 bg-ocean text-white rounded-xl font-bold">Back to Dashboard</Link>
                </div>
            </div>
        )
    }

    const totalAttempts = student.quizAttempts.length
    const totalScore = student.quizAttempts.reduce((acc, curr) => acc + curr.score, 0)
    const totalQuestions = student.quizAttempts.reduce((acc, curr) => acc + curr.totalQuestions, 0)
    const overallAccuracy = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0

    // Aggregate Weak Areas
    const weakAreasMap = new Map<string, number>()
    student.quizAttempts.forEach(attempt => {
        attempt.weakAreas.forEach(area => {
            weakAreasMap.set(area, (weakAreasMap.get(area) || 0) + 1)
        })
    })
    const sortedWeakAreas = Array.from(weakAreasMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)

    return (
        <div className="min-h-screen bg-background p-8 text-foreground selection:bg-ocean/30">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-6">
                        <Link href="/dashboard" className="p-3 glass rounded-2xl hover:bg-white/60 transition-all border border-white/40 group shadow-sm">
                            <ChevronLeft className="text-ocean group-hover:-translate-x-1 transition-transform" />
                        </Link>
                        <div>
                            <h1 className="text-4xl font-black tracking-tight text-ocean flex items-center gap-3">
                                {student.name}
                                <span className="text-xs font-black px-3 py-1 bg-ocean/10 text-ocean rounded-full border border-ocean/20 uppercase tracking-widest">Student Report</span>
                            </h1>
                            <p className="text-foreground/40 font-bold ml-1">{student.email}</p>
                        </div>
                    </div>
                    <div className="text-right glass px-6 py-3 rounded-2xl border border-white/40 shadow-sm">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 block mb-1">Last Active</span>
                        <span className="font-bold text-ocean">{student.updatedAt.toLocaleDateString()}</span>
                    </div>
                </div>

                {/* Top Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="glass p-8 rounded-[2.5rem] border border-white/50 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                            <LineChart size={80} />
                        </div>
                        <div className="text-5xl font-black text-ocean mb-2">{overallAccuracy}%</div>
                        <div className="text-xs font-black uppercase tracking-widest text-foreground/40">Overall Accuracy</div>
                    </div>
                    <div className="glass p-8 rounded-[2.5rem] border border-white/50 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                            <BrainCircuit size={80} />
                        </div>
                        <div className="text-5xl font-black text-ocean mb-2">{totalAttempts}</div>
                        <div className="text-xs font-black uppercase tracking-widest text-foreground/40">Quizzes Taken</div>
                    </div>
                    <div className="glass p-8 rounded-[2.5rem] border border-white/50 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                            <Clock size={80} />
                        </div>
                        <div className="text-3xl font-black text-ocean mb-2">{formatTime(student.totalTimeSpent)}</div>
                        <div className="text-xs font-black uppercase tracking-widest text-foreground/40">Total Study Time</div>
                    </div>
                    <div className="glass p-8 rounded-[2.5rem] border border-white/50 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                            <Target size={80} />
                        </div>
                        <div className="text-5xl font-black text-ocean mb-2">{sortedWeakAreas.length}</div>
                        <div className="text-xs font-black uppercase tracking-widest text-foreground/40">Topics to Improve</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-6">
                    {/* Left Column: Weak Areas */}
                    <div className="space-y-6">
                        <div className="glass p-8 rounded-[2rem] border border-white/40 shadow-xl">
                            <h3 className="text-xl font-black mb-6 flex items-center gap-3 text-ocean">
                                <Target size={20} className="text-red-500" />
                                Critical Weak Areas
                            </h3>
                            {sortedWeakAreas.length > 0 ? (
                                <div className="space-y-4">
                                    {sortedWeakAreas.map(([area, count], idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 bg-white/40 rounded-2xl border border-white/60 group hover:border-red-200 transition-all">
                                            <span className="font-bold text-foreground/70 group-hover:text-red-600 transition-colors">{area}</span>
                                            <span className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-xs font-black">Missed {count}x</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center py-10 text-foreground/30 font-bold italic">No data yet. Keep learning!</p>
                            )}
                        </div>

                        <div className="glass p-8 rounded-[2rem] border border-white/40 shadow-xl">
                            <h3 className="text-xl font-black mb-6 flex items-center gap-3 text-ocean">
                                <BookOpen size={20} className="text-green-500" />
                                Recommended Resources
                            </h3>
                            <div className="space-y-4">
                                <div className="p-4 bg-white/40 rounded-2xl border border-white/60">
                                    <p className="text-sm font-bold text-foreground/60 leading-relaxed italic">
                                        Based on {student.name}'s weak areas, prioritize foundational documentation on {sortedWeakAreas[0]?.[0] || 'active topics'}.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Quiz History & AI Reviews */}
                    <div className="lg:col-span-2 space-y-8">
                        <h2 className="text-2xl font-black text-ocean px-2 flex items-center gap-4">
                            Recent Learning History
                            <div className="flex-1 h-px bg-white/20"></div>
                        </h2>

                        {student.quizAttempts.length > 0 ? (
                            student.quizAttempts.map((attempt, idx) => (
                                <div key={attempt.id} className="glass p-8 rounded-[2.5rem] border border-white/50 shadow-xl hover:shadow-ocean/5 transition-all">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h4 className="text-2xl font-black text-ocean">{attempt.topic}</h4>
                                                <span className={`px-3 py-1 text-[10px] font-black rounded-full border border-current uppercase tracking-widest ${attempt.difficulty === 'Easy' ? 'bg-green-100 text-green-600' :
                                                    attempt.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-600' :
                                                        'bg-red-100 text-red-600'
                                                    }`}>
                                                    {attempt.difficulty}
                                                </span>
                                            </div>
                                            <p className="text-xs font-bold text-foreground/30 flex items-center gap-2">
                                                <Clock size={12} />
                                                {attempt.createdAt.toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-3xl font-black ${attempt.score / attempt.totalQuestions >= 0.7 ? 'text-green-600' : 'text-red-500'}`}>
                                                {attempt.score}/{attempt.totalQuestions}
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-foreground/30">Score</span>
                                        </div>
                                    </div>

                                    {attempt.review && (
                                        <div className="bg-white/40 p-6 rounded-3xl border border-white/60 relative overflow-hidden group">
                                            <div className="absolute -top-10 -right-10 p-4 opacity-[0.03] group-hover:scale-125 transition-all duration-700">
                                                <BrainCircuit size={100} />
                                            </div>
                                            <div className="flex items-center gap-2 text-ocean/40 font-black uppercase tracking-widest text-[10px] mb-3">
                                                AI Tutor Performance Review
                                            </div>
                                            <p className="text-lg font-bold text-foreground/70 leading-relaxed italic mb-4">
                                                "{attempt.review}"
                                            </p>

                                            <div className="flex flex-wrap gap-2">
                                                {attempt.learningTips.slice(0, 3).map((tip, i) => (
                                                    <span key={i} className="px-3 py-1.5 bg-ocean/5 text-ocean text-[10px] font-black rounded-lg border border-ocean/10">
                                                        💡 {tip}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="glass p-20 rounded-[3rem] border border-dashed border-white/60 text-center">
                                <p className="text-foreground/30 font-black text-xl">No quiz activity recorded yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
