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
        }, 60000); // update every minute

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
        <div style={{ textAlign: "center", marginTop: 60, padding: 20 }}>
            <h1>Го завршивте денешниот квиз 🎉</h1>

            <div
                style={{
                    marginTop: 30,
                    padding: 20,
                    border: "1px solid #ddd",
                    borderRadius: 12,
                    display: "inline-block",
                    minWidth: 280
                }}
            >
                <h2>Вашето задоволство: {data.avgScore} / 5</h2>

                <p style={{ marginTop: 15, fontSize: 16 }}>
                    {data.recommendation}
                </p>

                <p style={{ marginTop: 20, color: "#007bff", fontWeight: 600 }}>
                    Следниот квиз ќе биде достапен за: {timeLeft.hours}ч {timeLeft.minutes}м
                </p>
            </div>

            <p style={{ marginTop: 30, color: "#666" }}>
                Вратете се утре за нов дневен квиз 🙂
            </p>
        </div>
    );
}