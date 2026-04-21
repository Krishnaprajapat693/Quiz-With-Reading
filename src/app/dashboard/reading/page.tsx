"use client"

import { useState, useEffect, useRef, useMemo, Suspense } from "react"
import ReactMarkdown from "react-markdown"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { StructuredDoc, DocSection } from "@/lib/groq"

function ReadingContent() {
    const searchParams = useSearchParams()
    const topicParam = searchParams.get("topic")

    const [topic, setTopic] = useState(topicParam || "")
    const [loading, setLoading] = useState(false)
    const [doc, setDoc] = useState<StructuredDoc | null>(null)
    const [activeSectionId, setActiveSectionId] = useState<string | null>(null)
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

    // Find the currently active section object
    const activeSection = useMemo(() => {
        if (!doc || !doc.sections || doc.sections.length === 0) return null
        if (!activeSectionId) return doc.sections[0]

        const findSection = (sections: DocSection[]): DocSection | null => {
            if (!sections) return null
            for (const section of sections) {
                if (section.id === activeSectionId) return section
                if (section.subsections) {
                    const found = findSection(section.subsections)
                    if (found) return found
                }
            }
            return null
        }
        return findSection(doc.sections) || doc.sections[0]
    }, [doc, activeSectionId])

    // Track the path of active IDs to expand the sidebar
    const activePath = useMemo(() => {
        if (!doc || !doc.sections || !activeSectionId) return []
        const path: string[] = []

        const findPath = (sections: DocSection[], currentPath: string[]): boolean => {
            if (!sections) return false
            for (const section of sections) {
                if (section.id === activeSectionId) {
                    path.push(...currentPath, section.id)
                    return true
                }
                if (section.subsections) {
                    if (findPath(section.subsections, [...currentPath, section.id])) return true
                }
            }
            return false
        }

        findPath(doc.sections, [])
        return path
    }, [doc, activeSectionId])

    // Generate breadcrumbs helper
    const breadcrumbs = useMemo(() => {
        if (!doc || !doc.sections || !activeSectionId) return []
        const titles: string[] = []

        const findPath = (sections: DocSection[], currentPath: string[]): boolean => {
            if (!sections) return false
            for (const section of sections) {
                if (section.id === activeSectionId) {
                    titles.push(...currentPath, section.title)
                    return true
                }
                if (section.subsections) {
                    if (findPath(section.subsections, [...currentPath, section.title])) return true
                }
            }
            return false
        }

        findPath(doc.sections, [])
        return titles
    }, [doc, activeSectionId])

    // Extract H2 and H3 for "On this page" TOC
    const toc = useMemo(() => {
        if (!activeSection) return []
        const lines = activeSection.content.split('\n')
        const headings: { id: string; text: string; level: number }[] = []

        lines.forEach(line => {
            const match = line.match(/^(##|###) (.*)/)
            if (match) {
                const level = match[1].length
                const text = match[2].trim()
                const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
                headings.push({ id, text, level })
            }
        })
        return headings
    }, [activeSection])

    const fetchDocumentation = async (searchTopic: string) => {
        if (!searchTopic.trim()) return
        setLoading(true)
        setDoc(null)
        setActiveSectionId(null)
        try {
            const res = await fetch("/api/documentation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ topic: searchTopic })
            })
            const data = await res.json()
            if (data.documentation) {
                setDoc(data.documentation)
                if (data.documentation.sections && data.documentation.sections.length > 0) {
                    setActiveSectionId(data.documentation.sections[0].id)
                }
            } else {
                alert(data.error || "Failed to generate documentation")
            }
        } catch (error) {
            alert("An error occurred while fetching documentation")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (topicParam) {
            fetchDocumentation(topicParam)
        }
    }, [topicParam])

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-ocean/20 relative">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full bg-white/80 border-b border-slate-200 backdrop-blur-xl">
                <div className="container mx-auto max-w-[1440px] px-6 h-16 flex items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-ocean hover:border-ocean/30 transition-all">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        </Link>
                        <div className="h-6 w-[1px] bg-slate-200"></div>
                        <h1 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                            <svg className="w-4 h-4 text-ocean" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                            Documentation
                        </h1>
                    </div>

                    <div className="flex-1 max-w-xl relative">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && fetchDocumentation(topic)}
                            placeholder="Search topics..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-100/50 border-slate-200 border rounded-lg focus:bg-white focus:border-ocean/40 transition-all outline-none text-sm placeholder:text-slate-400"
                        />
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-200 px-2 py-1 rounded tracking-widest uppercase">Llama-3.3 Elite</span>
                    </div>
                </div>
            </header>

            <main className="container mx-auto max-w-[1440px] flex min-h-[calc(100vh-64px)]">
                {loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-8">
                        <div className="relative">
                            <div className="w-12 h-12 border-2 border-ocean/10 border-t-ocean rounded-full animate-spin"></div>
                        </div>
                        <div className="text-center animate-pulse">
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Architecting Knowledge</p>
                            <p className="text-base font-bold text-slate-900 italic">"{topic}"</p>
                        </div>
                    </div>
                ) : doc ? (
                    <>
                        {/* Progressive Sidebar */}
                        <aside className="w-72 flex-shrink-0 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto border-r border-slate-200 bg-white hidden lg:block p-8 pt-12 scrollbar-hide">
                            <div className="space-y-12">
                                <div>
                                    <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-6 px-4">
                                        Major Chapters
                                    </h5>
                                    <SidebarNav
                                        sections={doc.sections || []}
                                        activeId={activeSectionId}
                                        activePath={activePath}
                                        onSelect={(id) => {
                                            setActiveSectionId(id)
                                            window.scrollTo({ top: 0, behavior: "smooth" })
                                        }}
                                    />
                                </div>
                            </div>
                        </aside>

                        {/* Content Area */}
                        <div className="flex-1 min-w-0 bg-white">
                            <div className="max-w-4xl mx-auto px-8 md:px-16 py-12 pb-40">
                                <div className="animate-fade-in">
                                    {/* Breadcrumbs */}
                                    <nav className="flex items-center gap-2 text-[11px] font-medium text-slate-400 mb-10 overflow-x-auto whitespace-nowrap scrollbar-hide">
                                        <span className="text-slate-900 border-b border-slate-200 pb-1">{doc.topic}</span>
                                        {breadcrumbs.map((crumb, i) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <svg className="w-3 h-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                                <span className={`${i === breadcrumbs.length - 1 ? "text-ocean border-b border-ocean/30 pb-1" : "pb-1"}`}>{crumb}</span>
                                            </div>
                                        ))}
                                    </nav>

                                    {activeSection && (
                                        <article className="prose prose-slate prose-headings:font-bold prose-headings:tracking-tight prose-p:text-[#454e5e] prose-p:leading-[1.8] prose-pre:bg-slate-900 prose-pre:rounded-2xl max-w-none prose-a:text-ocean prose-a:no-underline hover:prose-a:underline">
                                            <div className="mb-12">
                                                <h1 className="text-4xl font-black text-slate-900 mb-6 tracking-tight leading-tight">{activeSection.title}</h1>
                                                {activeSection === doc.sections[0] && (
                                                    <div className="p-6 bg-ocean/5 rounded-2xl border border-ocean/10 text-slate-700 leading-relaxed text-base italic shadow-sm">
                                                        <span className="text-ocean font-bold block mb-2 text-[10px] uppercase tracking-widest not-italic">Executive Summary</span>
                                                        {doc.summary}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Render main content */}
                                            <div className="mt-8 leading-[1.8] text-lg text-slate-700 font-normal">
                                                <ReactMarkdown
                                                    components={{
                                                        h2: ({ node, ...props }) => {
                                                            const text = Array.isArray(props.children) ? props.children.join('') : props.children?.toString() || ""
                                                            const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
                                                            return <h2 id={id} {...props} className="text-2xl font-black text-slate-900 mt-16 scroll-mt-24 pb-4 border-b border-slate-100" />
                                                        },
                                                        h3: ({ node, ...props }) => {
                                                            const text = Array.isArray(props.children) ? props.children.join('') : props.children?.toString() || ""
                                                            const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
                                                            return <h3 id={id} {...props} className="text-xl font-black text-slate-900 mt-10 scroll-mt-24" />
                                                        },
                                                        pre: ({ node, ...props }) => <pre {...props} className="shadow-2xl border border-slate-800 p-6 !bg-[#0f172a]" />,
                                                        code: ({ node, ...props }) => <code {...props} className="bg-slate-100 text-ocean px-1.5 py-0.5 rounded font-mono text-sm leading-normal" />,
                                                        table: ({ node, ...props }) => (
                                                            <div className="overflow-x-auto my-12 border border-slate-200 rounded-xl">
                                                                <table {...props} className="w-full text-sm text-left border-collapse" />
                                                            </div>
                                                        ),
                                                        th: ({ node, ...props }) => <th {...props} className="bg-slate-50 border-b border-slate-200 p-4 font-black uppercase tracking-widest text-[10px] text-slate-500" />,
                                                        td: ({ node, ...props }) => <td {...props} className="border-b border-slate-100 p-4" />,
                                                    }}
                                                >
                                                    {activeSection.content}
                                                </ReactMarkdown>
                                            </div>

                                            {/* Render subtopics cards if children exist */}
                                            {activeSection.subsections && activeSection.subsections.length > 0 && (
                                                <div className="mt-20 pt-16 border-t border-slate-100">
                                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-8 px-1">Continuous Learning Tree</h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {activeSection.subsections.map((sub) => (
                                                            <button
                                                                key={sub.id}
                                                                onClick={() => {
                                                                    setActiveSectionId(sub.id)
                                                                    window.scrollTo({ top: 0, behavior: "smooth" })
                                                                }}
                                                                className="group flex flex-col items-start p-8 bg-slate-50/50 border border-slate-100 rounded-3xl hover:bg-white hover:border-ocean/30 hover:shadow-2xl hover:shadow-ocean/5 transition-all text-left"
                                                            >
                                                                <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-ocean mb-6 shadow-sm group-hover:bg-ocean group-hover:text-white transition-all transform group-hover:scale-110">
                                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                                                                </div>
                                                                <h4 className="text-lg font-black text-slate-900 mb-2 group-hover:text-ocean transition-colors">{sub.title}</h4>
                                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Deep-Dive Concept</p>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </article>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* TOC Sidebar */}
                        <aside className="w-64 flex-shrink-0 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto hidden xl:block p-8 border-l border-slate-100 pt-12">
                            <div className="space-y-10">
                                {toc.length > 0 && (
                                    <div>
                                        <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-6 px-1">
                                            On this page
                                        </h5>
                                        <ul className="space-y-4 border-l border-slate-100">
                                            {toc.map((item, i) => (
                                                <li key={i} style={{ paddingLeft: `${(item.level - 2) * 12}px` }}>
                                                    <button
                                                        onClick={() => {
                                                            const el = document.getElementById(item.id)
                                                            if (el) el.scrollIntoView({ behavior: 'smooth' })
                                                        }}
                                                        className="text-[11px] font-bold text-slate-500 hover:text-ocean transition-all text-left block py-1 border-l-2 border-transparent hover:border-ocean/20 pl-4 -ml-[2px]"
                                                    >
                                                        {item.text}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                <div className="p-6 rounded-2xl bg-slate-900 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 text-4xl font-black text-white/10 group-hover:scale-125 transition-transform italic select-none">!</div>
                                    <p className="text-[10px] font-black text-ocean uppercase tracking-widest mb-3 relative z-10">Pro Insight</p>
                                    <p className="text-xs font-bold text-white/70 leading-relaxed relative z-10">
                                        Use the Right Sidebar to jump between technical subsections immediately.
                                    </p>
                                </div>
                            </div>
                        </aside>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] text-center px-6">
                        <div className="w-20 h-20 bg-ocean rounded-3xl flex items-center justify-center text-white text-3xl mb-12 shadow-2xl shadow-ocean/30 animate-float">
                            📖
                        </div>
                        <h2 className="text-6xl font-black text-slate-900 tracking-tighter mb-6 leading-none italic">Technical<br />Command Center.</h2>
                        <p className="text-lg text-slate-500 font-bold max-w-xl mx-auto mb-10 leading-relaxed opacity-70">
                            The definitive knowledge engine for exhaustive technical documentation. Built for architects and domain experts.
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {["PostgreSQL Internals", "GraphQL vs GRPC", "Kernel Architecture", "React Fiber"].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => { setTopic(s); fetchDocumentation(s); }}
                                    className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-600 hover:border-ocean/40 hover:text-ocean hover:shadow-xl hover:shadow-ocean/5 transition-all"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}

export default function ReadingPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center"><div className="w-12 h-12 border-2 border-ocean/10 border-t-ocean rounded-full animate-spin"></div></div>}>
            <ReadingContent />
        </Suspense>
    )
}

function SidebarNav({ sections, activeId, activePath, onSelect, depth = 0 }: {
    sections: DocSection[],
    activeId: string | null,
    activePath: string[],
    onSelect: (id: string) => void,
    depth?: number
}) {
    return (
        <nav className={`flex flex-col space-y-1 relative ${depth > 0 ? "mt-1 ml-4" : ""}`}>
            {depth > 0 && (
                <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-slate-100 ml-[-16px]"></div>
            )}
            {sections.map((section) => {
                const isActive = activeId === section.id
                const isExpanded = activePath.includes(section.id)

                return (
                    <div key={section.id} className="relative">
                        <button
                            onClick={() => onSelect(section.id)}
                            className={`w-full text-left px-4 py-2 text-[11px] font-bold transition-all rounded-lg flex items-center justify-between group relative
                                ${isActive
                                    ? "text-ocean bg-ocean/5 font-black"
                                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                }`}
                        >
                            {isActive && (
                                <div className="absolute left-0 top-1.5 bottom-1.5 w-[2px] bg-ocean rounded-full"></div>
                            )}
                            <span className="truncate pr-2">{section.title}</span>
                            {section.subsections && section.subsections.length > 0 && (
                                <svg className={`w-3 h-3 text-slate-300 group-hover:text-ocean/50 transition-transform ${isExpanded ? "rotate-90 text-ocean/50" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                            )}
                        </button>
                        {isExpanded && section.subsections && (
                            <div className="animate-fade-in">
                                <SidebarNav
                                    sections={section.subsections}
                                    activeId={activeId}
                                    activePath={activePath}
                                    onSelect={onSelect}
                                    depth={depth + 1}
                                />
                            </div>
                        )}
                    </div>
                )
            })}
        </nav>
    )
}
