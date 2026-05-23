import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";

function getTimeUntilMidnight() {
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setHours(24, 0, 0, 0);

    const diff = tomorrow.getTime() - now.getTime();

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return { hours, minutes };
}

export function QuizCompleted() {
    const [data, setData] = useState<any>(null);
    const [timeLeft, setTimeLeft] = useState(getTimeUntilMidnight());

    useEffect(() => {
        const loadQuiz = async () => {
            const user = auth.currentUser;
            if (!user) return;

            const today = new Date().toISOString().split("T")[0];

            const ref = doc(db, "users", user.uid, "dailyQuizzes", today);
            const snap = await getDoc(ref);

            if (snap.exists()) {
                setData(snap.data());
            }
        };

        loadQuiz();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(getTimeUntilMidnight());
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    if (!data) {
        return (
            <div style={{ textAlign: "center", marginTop: 80 }}>
                <h2>Loading results...</h2>
            </div>
        );
    }

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#f5f7fb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 20
            }}
        >
            {/* CARD */}
            <div
                style={{
                    width: 700,
                    background: "white",
                    borderRadius: 16,
                    padding: 28,
                    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                    textAlign: "center",
                    transform: "translateY(-260px)"
                }}
            >
                <h1>Го завршивте денешниот квиз 🎉</h1>

                <div
                    style={{
                        marginTop: 25,
                        padding: 20,
                        border: "1px solid #eee",
                        borderRadius: 12,
                        background: "#fafafa"
                    }}
                >
                    <h2 style={{ marginBottom: 10 }}>
                        Вашето задоволство денеска: {data.avgScore} / 5
                    </h2>

                    <p style={{ fontSize: 16, marginBottom: 15 }}>
                        {data.recommendation}
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
                        Следниот квиз ќе се отвори за: {timeLeft.hours}ч {timeLeft.minutes}м
                    </div>
                </div>

                <p style={{ marginTop: 25, color: "#666" }}>
                    Вратете се наскоро!
                </p>
            </div>
        </div>
    );
}