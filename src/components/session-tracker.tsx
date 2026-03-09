"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState, useRef } from "react"

const PING_INTERVAL_MS = 15000 // 15 seconds

export function SessionTracker() {
    const { data: session, status } = useSession()
    const [sessionId, setSessionId] = useState<string | null>(null)

    // Use refs for values that shouldn't trigger re-renders or effect re-runs
    const lastActivityRef = useRef<number>(Date.now())
    const lastPingTimeRef = useRef<number>(0)
    const sessionIdRef = useRef<string | null>(null)

    // Keep ref in sync with state for use in the interval
    useEffect(() => {
        sessionIdRef.current = sessionId
    }, [sessionId])

    useEffect(() => {
        const handleActivity = () => {
            lastActivityRef.current = Date.now()
        }

        const events = ["mousemove", "keydown", "scroll", "click"]
        events.forEach(event => window.addEventListener(event, handleActivity))

        return () => {
            events.forEach(event => window.removeEventListener(event, handleActivity))
        }
    }, [])

    useEffect(() => {
        if (status !== "authenticated") return

        const interval = setInterval(() => {
            const now = Date.now()

            // If user has been inactive for more than 60 seconds, don't ping
            const isInactive = now - lastActivityRef.current > 60000

            // Prevent pinging too frequently
            const timeSinceLastPing = now - lastPingTimeRef.current
            if (timeSinceLastPing < PING_INTERVAL_MS - 1000) return

            if (!isInactive) {
                lastPingTimeRef.current = now
                fetch("/api/sessions/ping", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ sessionId: sessionIdRef.current })
                })
                    .then(async res => {
                        if (res.ok) return res.json()
                        if (res.status === 401) {
                            console.warn("Session expired, stopping pings")
                            clearInterval(interval)
                            return null
                        }
                        const text = await res.text()
                        throw new Error(`Ping failed with status ${res.status}: ${text}`)
                    })
                    .then(data => {
                        if (data?.sessionId && data.sessionId !== sessionIdRef.current) {
                            setSessionId(data.sessionId)
                        }
                    })
                    .catch(err => {
                        console.error("Session tracker error:", err.message)
                    })
            }
        }, 5000) // Check every 5 seconds

        return () => clearInterval(interval)
    }, [status]) // Only depend on status

    return null
}
