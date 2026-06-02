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
    const { user, loading } = useAuth(); // 👈 IMPORTANT
    const [data, setData] = useState<any>(null);
    const [timeLeft, setTimeLeft] = useState(getTimeUntilMidnight());

    useEffect(() => {
        const loadQuiz = async () => {
            if (!user) return;

            const today = new Date().toISOString().split("T")[0];

            const ref = doc(db, "users", user.uid, "dailyQuizzes", today);
            const snap = await getDoc(ref);

            if (snap.exists()) {
                setData(snap.data());
            }
        };

        loadQuiz();
    }, [user]);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(getTimeUntilMidnight());
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div style={{ textAlign: "center", marginTop: 80 }}>
                <h2>Loading...</h2>
            </div>
        );
    }

    if (!data) {
        return (
            <div style={{ textAlign: "center", marginTop: 80 }}>
                <h2>No quiz data found.</h2>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: "100vh",
            background: "#f5f7fb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20
        }}>
            <div style={{
                width: 700,
                background: "white",
                borderRadius: 16,
                padding: 28,
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                textAlign: "center",
                transform: "translateY(-260px)"
            }}>
                <h1>You have completed today's mood quiz! 🎉</h1>

                <div style={{
                    marginTop: 25,
                    padding: 20,
                    border: "1px solid #eee",
                    borderRadius: 12,
                    background: "#fafafa"
                }}>
                    <h2>
                        Mood score:<br />
                        {data.avgScore} / 5
                    </h2>

                    <p style={{ fontSize: 16, marginBottom: 15 }}>
                        {data.recommendation}
                    </p>

                    <div style={{
                        marginTop: 15,
                        padding: 12,
                        borderRadius: 10,
                        background: "#eef5ff",
                        color: "#007bff",
                        fontWeight: 600
                    }}>
                        Next quiz in: {timeLeft.hours}h {timeLeft.minutes}m
                    </div>
                    <p style={{ marginTop: 25, color: "#666" }}>
                        Come back soon!
                    </p>
                </div>
            </div>
        </div>
    );
}