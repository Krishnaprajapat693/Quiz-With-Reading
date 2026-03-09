"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function QuickQuiz() {
    const [topic, setTopic] = useState("")
    const router = useRouter()

    const handleStart = (e: React.FormEvent) => {
        e.preventDefault()
        if (topic.trim()) {
            router.push(`/quiz?topic=${encodeURIComponent(topic.trim())}`)
        }
    }

    return (
        <form onSubmit={handleStart} className="mb-12">
            <div className="glass p-2 pl-6 rounded-2xl flex items-center gap-4 border border-white/40 shadow-xl focus-within:ring-2 focus-within:ring-ocean/30 transition-all bg-white/40">
                <svg className="w-6 h-6 text-ocean/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Wanna learn something specific? Type it here..."
                    className="flex-1 bg-transparent border-none outline-none text-foreground font-bold placeholder:text-foreground/30 py-4"
                />
                <button
                    type="submit"
                    disabled={!topic.trim()}
                    className="bg-ocean text-white px-8 py-4 rounded-xl font-bold hover:bg-ocean/90 transition-all shadow-lg shadow-ocean/20 active:scale-95 disabled:opacity-50 disabled:grayscale"
                >
                    Start Quick Quiz
                </button>
            </div>
            <p className="text-xs text-foreground/40 mt-3 ml-2 font-bold uppercase tracking-widest italic">AI will generate a personalized quiz based on your topic</p>
        </form>
    )
}
