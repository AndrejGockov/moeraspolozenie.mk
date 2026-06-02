import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../hooks/useAuth";

function getTimeUntilMidnight() {
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setHours(24, 0, 0, 0);
    const diff = tomorrow.getTime() - now.getTime();
    return {
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    };
}

export function QuizCompleted() {
    const { user } = useAuth();
    const today = new Date().toISOString().split("T")[0];

    // ⚡ INSTANT UI: Pull instantly from local cache to prevent loading text flashes
    const [data, setData] = useState(() => {
        const cached = localStorage.getItem(`quiz_${today}`);
        return cached ? JSON.parse(cached) : null;
    });

    const [timeLeft, setTimeLeft] = useState(getTimeUntilMidnight());

    useEffect(() => {
        const loadQuiz = async () => {
            if (!user || data) return; // Skip network completely if cache is already warm

            const ref = doc(db, "users", user.uid, "dailyQuizzes", today);
            const snap = await getDoc(ref);

            if (snap.exists()) {
                const quizData = snap.data();
                setData(quizData);
                localStorage.setItem(`quiz_${today}`, JSON.stringify(quizData));
            }
        };

        loadQuiz();
    }, [user, today, data]);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(getTimeUntilMidnight());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const isLoadingData = !data;

    return (
        <div
            style={{
                width: 700,
                background: "white",
                borderRadius: 16,
                padding: 28,
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                textAlign: "center",
                boxSizing: "border-box"
            }}
        >
            <h1>You have completed today's mood quiz! 🎉</h1>

            <div
                style={{
                    marginTop: 25,
                    padding: 20,
                    border: "1px solid #eee",
                    borderRadius: 12,
                    background: "#fafafa",
                    boxSizing: "border-box"
                }}
            >
                <h2>
                    Mood score:<br />
                    {isLoadingData ? "..." : `${data.avgScore} / 5`}
                </h2>

                <p style={{ fontSize: 16, marginBottom: 15 }}>
                    {isLoadingData ? "Loading recommendation..." : data.recommendation}
                </p>

                <div
                    style={{
                        marginTop: 15,
                        padding: 12,
                        borderRadius: 10,
                        background: "#eef5ff",
                        color: "#007bff",
                        fontWeight: 600
                    }}
                >
                    Next quiz in: {timeLeft.hours}h {timeLeft.minutes}m
                </div>

                <p style={{ marginTop: 25, color: "#666" }}>
                    Come back soon!
                </p>
            </div>
        </div>
    );
}