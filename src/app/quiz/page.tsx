"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"

interface Question {
    question: string
    options: string[]
    answer: string
    explanation: string
}

export default function QuizPageWrapper() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-foreground space-y-4">
                <svg className="animate-spin h-10 w-10 text-ocean" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            </div>
        }>
            <QuizPage />
        </Suspense>
    )
}

function QuizPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const topicParam = searchParams.get("topic")

    const [topic, setTopic] = useState(topicParam || "")
    const [count, setCount] = useState(5)
    const [difficulty, setDifficulty] = useState("Easy")
    const [step, setStep] = useState(topicParam ? 1 : 0) // 0: Topic, 1: Count, 2: Difficulty, 3: Quiz, 4: Results

    const [questions, setQuestions] = useState<Question[]>([])
    const [loading, setLoading] = useState(false)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [score, setScore] = useState(0)
    const [selectedOption, setSelectedOption] = useState<string | null>(null)
    const [userAnswers, setUserAnswers] = useState<{ question: string, selected: string, correct: string, explanation: string }[]>([])
    const [showExplanation, setShowExplanation] = useState(false)
    const [quizFinished, setQuizFinished] = useState(false)
    const [savingResult, setSavingResult] = useState(false)
    const [performanceReview, setPerformanceReview] = useState<null | { review: string, weakAreas: string[], learningTips: string[] }>(null)
    const [loadingReview, setLoadingReview] = useState(false)

    const startQuiz = async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/quiz/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ topic, difficulty, count })
            })
            const data = await res.json()
            if (data.questions) {
                setQuestions(data.questions)
                setCurrentIndex(0)
                setScore(0)
                setUserAnswers([])
                setQuizFinished(false)
                setSelectedOption(null)
                setStep(3)
                setShowExplanation(false)
            } else {
                alert(data.error || "Failed to load")
            }
        } catch (e) {
            alert("Error starting quiz")
        } finally {
            setLoading(false)
        }
    }

    const handleOptionClick = (option: string) => {
        if (showExplanation) return
        setSelectedOption(option)
        setShowExplanation(true)

        const isCorrect = option === questions[currentIndex].answer;
        if (isCorrect) {
            setScore((s: number) => s + 1)
        }

        setUserAnswers(prev => [...prev, {
            question: questions[currentIndex].question,
            selected: option,
            correct: questions[currentIndex].answer,
            explanation: questions[currentIndex].explanation
        }])
    }

    const handleNext = async () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex((c: number) => c + 1)
            setSelectedOption(null)
            setShowExplanation(false)
        } else {
            setQuizFinished(true)
            setStep(4)
            setSavingResult(true)

            // Fetch AI Review First
            setLoadingReview(true)
            let reviewData = null;
            try {
                const res = await fetch("/api/quiz/review", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ topic, score, total: questions.length, results: userAnswers })
                })
                reviewData = await res.json()
                setPerformanceReview(reviewData)
            } catch (err) {
                console.error("Failed to fetch review", err)
            } finally {
                setLoadingReview(false)
            }

            // Sync with DB including review
            fetch("/api/quiz/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    topic,
                    difficulty,
                    score,
                    totalQuestions: questions.length,
                    review: reviewData?.review,
                    weakAreas: reviewData?.weakAreas,
                    learningTips: reviewData?.learningTips
                })
            }).finally(() => setSavingResult(false));
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-foreground space-y-4">
                <svg className="animate-spin h-10 w-10 text-ocean" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <p className="text-xl font-bold animate-pulse text-ocean/80">AI is crafting your quiz...</p>
            </div>
        )
    }

    // STEP 0: TOPIC SELECTION
    if (step === 0) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-foreground">
                <div className="glass p-8 rounded-2xl w-full max-w-md border border-white/40 shadow-xl">
                    <h2 className="text-2xl font-bold mb-4 text-ocean">Enter a Topic</h2>
                    <p className="text-foreground/60 mb-6 text-sm">Type any subject you want to learn about.</p>
                    <input
                        value={topic}
                        onChange={e => setTopic(e.target.value)}
                        className="w-full px-4 py-3 bg-white/40 border border-white/40 rounded-xl mb-6 text-foreground focus:outline-none focus:ring-2 focus:ring-ocean transition-all placeholder:text-foreground/30 font-bold"
                        placeholder="E.g., Quantum Physics, Python, Cooking..."
                    />
                    <button
                        disabled={!topic.trim()}
                        onClick={() => setStep(1)}
                        className="w-full py-4 bg-ocean text-white rounded-xl font-bold hover:bg-ocean/90 transition-all shadow-lg shadow-ocean/20 active:scale-95 disabled:opacity-50"
                    >
                        Next: Question Count
                    </button>
                    <Link href="/dashboard" className="block text-center mt-6 text-ocean/60 hover:text-ocean font-bold text-sm underline decoration-dotted">Back to Dashboard</Link>
                </div>
            </div>
        )
    }

    // STEP 1: COUNT SELECTION
    if (step === 1) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-foreground">
                <div className="glass p-8 rounded-2xl w-full max-w-md border border-white/40 shadow-xl">
                    <button onClick={() => setStep(0)} className="text-ocean/60 hover:text-ocean font-bold mb-4 text-sm">&larr; Change Topic</button>
                    <h2 className="text-2xl font-bold mb-2 text-ocean">How many questions?</h2>
                    <p className="text-foreground/60 mb-8 font-medium">Selected topic: <span className="text-ocean font-bold">{topic}</span></p>

                    <div className="grid grid-cols-3 gap-3 mb-8">
                        {[5, 10, 15].map(n => (
                            <button
                                key={n}
                                onClick={() => setCount(n)}
                                className={`py-4 rounded-xl border font-bold transition-all ${count === n ? 'bg-ocean text-white shadow-lg' : 'glass border-white/40 hover:bg-white/60'}`}
                            >
                                {n}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setStep(2)}
                        className="w-full py-4 bg-ocean text-white rounded-xl font-bold hover:bg-ocean/90 transition-all shadow-lg shadow-ocean/20 active:scale-95"
                    >
                        Next: Difficulty
                    </button>
                </div>
            </div>
        )
    }

    // STEP 2: DIFFICULTY SELECTION
    if (step === 2) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-foreground">
                <div className="glass p-10 rounded-3xl w-full max-w-lg border border-white/40 shadow-2xl">
                    <button onClick={() => setStep(1)} className="text-ocean/60 hover:text-ocean font-bold mb-4 text-sm">&larr; Change Count</button>
                    <h1 className="text-4xl font-extrabold mb-2 tracking-tight text-ocean">{topic}</h1>
                    <p className="text-foreground/60 mb-10 font-medium">Almost ready. Choose your difficulty.</p>

                    <div className="space-y-4 mb-10">
                        {["Easy", "Medium", "Hard"].map(level => (
                            <button
                                key={level}
                                onClick={() => setDifficulty(level)}
                                className={`w-full py-5 px-6 rounded-2xl flex items-center justify-between border transition-all ${difficulty === level
                                    ? "bg-ocean text-white shadow-xl shadow-ocean/30 border-ocean scale-[1.02]"
                                    : "glass border-white/40 text-foreground/70 hover:bg-white/60"
                                    }`}
                            >
                                <span className="font-bold text-xl">{level}</span>
                                {difficulty === level && <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={startQuiz}
                        className="w-full py-5 bg-ocean hover:bg-ocean/90 text-white rounded-2xl font-bold text-xl shadow-xl shadow-ocean/30 transition-all active:scale-95"
                    >
                        Generate & Start Quiz
                    </button>
                </div>
            </div>
        )
    }

    // STEP 3: THE QUIZ
    if (step === 3) {
        const q = questions[currentIndex]

        if (!q || !q.options) {
            return (
                <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-foreground">
                    <div className="glass p-8 rounded-2xl max-w-md w-full border border-white/40 shadow-xl text-center">
                        <h2 className="text-2xl font-bold mb-4 text-ocean">Oops! Malformed data</h2>
                        <button onClick={() => setStep(0)} className="w-full py-4 bg-ocean text-white rounded-xl font-bold">Try Another Topic</button>
                    </div>
                </div>
            )
        }

        return (
            <div className="min-h-screen bg-background flex flex-col items-center pt-28 p-6 text-foreground relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-20 left-10 w-64 h-64 bg-ocean/5 blur-[100px] rounded-full pointer-events-none"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-ocean/5 blur-[120px] rounded-full pointer-events-none"></div>

                <div className="w-full max-w-3xl z-10">
                    <div className="flex justify-between items-end mb-10 px-2">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-3 py-1 bg-ocean/10 text-ocean text-xs font-black uppercase tracking-widest rounded-full border border-ocean/20 shadow-sm">
                                    {topic}
                                </span>
                                <span className="px-3 py-1 bg-white/40 text-foreground/40 text-xs font-black uppercase tracking-widest rounded-full border border-white/40 shadow-sm">
                                    {difficulty}
                                </span>
                            </div>
                            <h1 className="text-foreground/40 font-bold tracking-tight">Question <span className="text-ocean text-lg">{currentIndex + 1}</span> <span className="text-xs">of</span> <span className="text-lg">{questions.length}</span></h1>
                        </div>
                        <div className="text-right">
                            <span className="text-xs font-black uppercase tracking-widest text-foreground/30 block mb-1">Accuracy</span>
                            <span className="text-2xl font-black text-ocean">{Math.round((score / (currentIndex || 1)) * 100)}%</span>
                        </div>
                    </div>

                    <div className="glass p-10 md:p-14 rounded-[3rem] mb-10 relative border border-white/50 shadow-2xl backdrop-blur-2xl">
                        {/* Elegant Progress Bar */}
                        <div className="absolute top-0 left-0 w-full h-2 bg-white/20">
                            <div
                                className="h-full bg-ocean transition-all duration-700 ease-out relative"
                                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                            >
                                <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                            </div>
                        </div>

                        <h2 className="text-3xl md:text-4xl font-black mb-12 leading-tight tracking-tight text-ocean drop-shadow-sm">
                            {q.question}
                        </h2>

                        <div className="grid grid-cols-1 gap-5">
                            {q.options.map((opt: string, i: number) => {
                                const isSelected = selectedOption === opt;
                                const isCorrect = opt === q.answer;

                                let btnClass = "glass border-white/60 hover:border-ocean/40 hover:bg-white/80 text-foreground/80 hover:scale-[1.01] hover:shadow-lg"

                                if (showExplanation) {
                                    if (isCorrect) {
                                        btnClass = "bg-green-500 text-white border-green-400 shadow-xl shadow-green-500/20 scale-[1.02] ring-4 ring-green-500/10"
                                    } else if (isSelected) {
                                        btnClass = "bg-red-500 text-white border-red-400 shadow-xl shadow-red-500/20 opacity-90"
                                    } else {
                                        btnClass = "glass border-white/20 opacity-30 text-foreground/20 cursor-not-allowed grayscale-[0.5]"
                                    }
                                } else if (isSelected) {
                                    btnClass = "border-ocean bg-ocean/5 text-ocean ring-4 ring-ocean/10 scale-[1.01] shadow-xl shadow-ocean/5"
                                }

                                return (
                                    <button
                                        key={i}
                                        onClick={() => handleOptionClick(opt)}
                                        disabled={showExplanation}
                                        className={`group w-full text-left p-6 md:p-8 rounded-2xl font-black text-lg md:text-xl transition-all duration-300 ${btnClass} flex items-center justify-between border relative overflow-hidden active:scale-[0.98]`}
                                    >
                                        <div className="flex items-center gap-6 relative z-10">
                                            <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm border ${isSelected ? 'bg-white/20 border-white/40' : 'bg-ocean/5 border-ocean/10 text-ocean/40'}`}>
                                                {String.fromCharCode(65 + i)}
                                            </span>
                                            <span className="flex-1">{opt}</span>
                                        </div>

                                        <div className="relative z-10">
                                            {showExplanation && (
                                                <div className="animate-in zoom-in duration-300">
                                                    {isCorrect ? (
                                                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center border border-white/40">
                                                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                                                        </div>
                                                    ) : isSelected ? (
                                                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center border border-white/40">
                                                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M6 18L18 6M6 6l12 12" /></svg>
                                                        </div>
                                                    ) : null}
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                )
                            })}
                        </div>

                        {showExplanation && (
                            <div className="mt-12 p-8 rounded-3xl bg-white/60 border border-ocean/10 animate-in fade-in slide-in-from-top-6 shadow-sm ring-1 ring-white/50">
                                <div className="flex items-center gap-3 mb-4 text-ocean font-black uppercase tracking-widest text-xs">
                                    <div className="w-2 h-2 bg-ocean rounded-full animate-ping"></div>
                                    AI Teacher Insight
                                </div>
                                <p className="text-foreground/70 leading-relaxed font-bold text-lg md:text-xl italic">"{q.explanation}"</p>
                            </div>
                        )}
                    </div>

                    {showExplanation && (
                        <div className="flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <button
                                onClick={handleNext}
                                className="group py-6 px-12 bg-ocean hover:bg-ocean/90 text-white font-black text-xl rounded-2xl shadow-2xl shadow-ocean/30 transition-all flex items-center gap-4 active:scale-95 hover:scale-[1.02]"
                            >
                                {currentIndex < questions.length - 1 ? "Next Challenge" : "Reveal Final Score"}
                                <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    // STEP 4: FINAL RESULTS & AI REVIEW
    if (step === 4) {
        const isGood = score / questions.length >= 0.7;

        return (
            <div className="min-h-screen bg-background flex flex-col items-center py-12 p-6 text-foreground">
                <div className="max-w-4xl w-full space-y-8">
                    {/* Header Summary Card */}
                    <div className="glass p-10 rounded-3xl border border-white/40 shadow-2xl text-center relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-ocean/10 blur-[50px] rounded-full"></div>
                        <div className={`w-28 h-28 mx-auto rounded-full flex items-center justify-center mb-6 border-4 shadow-xl ${isGood ? 'border-green-500 text-green-600 bg-green-500/10' : 'border-yellow-500 text-yellow-600 bg-yellow-500/10'}`}>
                            <span className="text-5xl font-extrabold">{score}</span>
                        </div>
                        <h2 className="text-4xl font-extrabold mb-2 text-ocean">{isGood ? "Fantastic Work!" : "Great Effort!"}</h2>
                        <p className="text-xl font-bold text-foreground/70 mb-8">You got {score} out of {questions.length} correct in {topic}.</p>

                        <div className="flex flex-wrap gap-4 justify-center">
                            <Link href="/dashboard" className="px-8 py-4 bg-ocean text-white rounded-xl font-bold shadow-lg shadow-ocean/20 hover:scale-105 transition-all">Go to Dashboard</Link>
                            <button onClick={() => setStep(0)} className="px-8 py-4 glass text-ocean border-white/40 rounded-xl font-bold hover:bg-white/60 transition-all">Try New Topic</button>
                        </div>
                    </div>

                    {/* AI Performance Review Section */}
                    <div className="glass p-8 rounded-3xl border border-white/40 shadow-xl">
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-ocean">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                            AI Performance Analysis
                        </h3>

                        {loadingReview ? (
                            <div className="space-y-4 py-8 animate-pulse">
                                <div className="h-4 bg-ocean/10 rounded w-3/4"></div>
                                <div className="h-4 bg-ocean/10 rounded w-full"></div>
                                <div className="h-4 bg-ocean/10 rounded w-1/2"></div>
                            </div>
                        ) : performanceReview ? (
                            <div className="space-y-8 animate-in fade-in duration-500">
                                <div>
                                    <h4 className="text-sm font-bold uppercase tracking-wider text-ocean/60 mb-2">Tutor Summary</h4>
                                    <p className="text-lg font-medium leading-relaxed">{performanceReview.review}</p>
                                </div>
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="bg-red-50/50 p-6 rounded-2xl border border-red-200">
                                        <h4 className="text-sm font-bold uppercase tracking-wider text-red-600 mb-3">Target Weak Areas</h4>
                                        <ul className="space-y-2">
                                            {performanceReview.weakAreas.map((area, idx) => (
                                                <li key={idx} className="flex items-center gap-2 font-bold text-red-800">
                                                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                                                    {area}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="bg-green-50/50 p-6 rounded-2xl border border-green-200">
                                        <h4 className="text-sm font-bold uppercase tracking-wider text-green-600 mb-3">How to Learn This</h4>
                                        <ul className="space-y-2">
                                            {performanceReview.learningTips.map((tip, idx) => (
                                                <li key={idx} className="flex items-center gap-2 font-bold text-green-800">
                                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                                                    {tip}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-center py-8 text-foreground/40 font-bold italic">Analysis failed to load.</p>
                        )}
                    </div>

                    {/* Detailed Result Breakdown */}
                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-ocean px-2">Detailed Answer Review</h3>
                        {userAnswers.map((ans, idx) => (
                            <div key={idx} className="glass p-6 rounded-3xl border border-white/40 shadow-lg">
                                <div className="flex items-start gap-4 mb-4">
                                    <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${ans.selected === ans.correct ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                        {idx + 1}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-lg font-bold mb-4 text-ocean">{ans.question}</p>
                                        <div className="grid md:grid-cols-2 gap-4 mb-4 text-sm font-bold">
                                            <div className={`p-4 rounded-xl border ${ans.selected === ans.correct ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                                                <span className="text-xs uppercase opacity-60 block mb-1">Your Answer</span>
                                                {ans.selected}
                                            </div>
                                            {ans.selected !== ans.correct && (
                                                <div className="p-4 rounded-xl border bg-green-50 border-green-200 text-green-700">
                                                    <span className="text-xs uppercase opacity-60 block mb-1">Correct Answer</span>
                                                    {ans.correct}
                                                </div>
                                            )}
                                        </div>
                                        <div className="bg-white/40 p-5 rounded-2xl border border-white/40 shadow-inner">
                                            <div className="flex items-center gap-2 mb-2 text-ocean/80">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                <span className="text-xs uppercase font-extrabold tracking-widest">Feedback</span>
                                            </div>
                                            <p className="text-foreground/80 font-medium leading-relaxed">{ans.explanation}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return null
}
