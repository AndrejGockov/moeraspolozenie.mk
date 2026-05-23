import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { calculateAverageScore } from "../../utils/avgHappiness";
import { getRecommendation } from "../../utils/recommendation";

export function DailyQuiz() {
    const navigate = useNavigate();

    const [checking, setChecking] = useState(true);
    const [answers, setAnswers] = useState<number[]>(Array(10).fill(0));

    const questions = [
        "Денес се чувствував среќно:",
        "Денес бев продуктивен/на:",
        "Имав доволно енергија денес:",
        "Се чувствував мотивирано:",
        "Добро се справив со стресот денес:",
        "Се чувствував поврзан/а со другарите:",
        "Се грижев за себе денес:",
        "Се чувствував позитивно:",
        "Бев задоволен/на од денот:",
        "Се чувствувам надежно за утре:"
    ];

    useEffect(() => {
        const checkToday = async () => {
            const user = auth.currentUser;

            if (!user) {
                setChecking(false);
                return;
            }

            const today = new Date().toISOString().split("T")[0];
            const ref = doc(db, "users", user.uid, "dailyQuizzes", today);

            const snap = await getDoc(ref);

            if (snap.exists()) {
                navigate("/quiz/completed");
                return;
            }

            setChecking(false);
        };

        checkToday();
    }, [navigate]);

    const handleSelect = (index: number, value: number) => {
        const updated = [...answers];
        updated[index] = value;
        setAnswers(updated);
    };

    const handleSubmit = async () => {
        const user = auth.currentUser;
        if (!user) return;

        const avg = calculateAverageScore(answers);
        const recommendation = getRecommendation(avg);

        const today = new Date().toISOString().split("T")[0];

        await setDoc(doc(db, "users", user.uid, "dailyQuizzes", today), {
            answers,
            avgScore: avg,
            recommendation,
            createdAt: serverTimestamp()
        });

        navigate("/quiz/completed");
    };

    const isComplete = answers.every((a) => a > 0);

    // 🔥 LOADING STATE (fixes flicker + UX)
    if (checking) {
        return (
            <div style={{ padding: 20, textAlign: "center" }}>
                Се проверува дали веќе сте го пополниле квизот...
            </div>
        );
    }

    return (
        <div
            style={{
                maxWidth: 650,
                margin: "0 auto",
                padding: 20,
                fontFamily: "system-ui, sans-serif"
            }}
        >
            <h1 style={{ marginBottom: 10 }}>Квиз за задоволство</h1>

            {/* SCALE */}
            <div
                style={{
                    marginBottom: 25,
                    color: "#666",
                    fontSize: 13,
                    lineHeight: 1.6,
                    display: "grid",
                    gap: 4
                }}
            >
                <div>Изберете одговор за секое прашање:</div>
                <div>1 = Воопшто не се согласувам</div>
                <div>2 = Не се согласувам</div>
                <div>3 = Неутрално</div>
                <div>4 = Се согласувам</div>
                <div>5 = Потполно се согласувам</div>
            </div>

            {questions.map((q, i) => (
                <div
                    key={i}
                    style={{
                        marginBottom: 28,
                        padding: 14,
                        border: "1px solid #eee",
                        borderRadius: 12,
                        background: "#fafafa"
                    }}
                >
                    <p style={{ fontSize: 17, fontWeight: 600, marginBottom: 12 }}>
                        {q}
                    </p>

                    <div style={{ display: "flex", gap: 10 }}>
                        {[1, 2, 3, 4, 5].map((num) => (
                            <button
                                key={num}
                                onClick={() => handleSelect(i, num)}
                                style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 10,
                                    border: "1px solid #ddd",
                                    background: answers[i] === num ? "#007bff" : "white",
                                    color: answers[i] === num ? "white" : "#333",
                                    cursor: "pointer",
                                    fontWeight: 600,
                                    transition: "all 0.15s ease"
                                }}
                            >
                                {num}
                            </button>
                        ))}
                    </div>
                </div>
            ))}

            <button
                onClick={handleSubmit}
                disabled={!isComplete}
                style={{
                    width: "100%",
                    padding: 14,
                    marginTop: 10,
                    background: isComplete ? "#007bff" : "#ccc",
                    color: "white",
                    border: "none",
                    borderRadius: 10,
                    cursor: isComplete ? "pointer" : "not-allowed",
                    fontWeight: 600,
                    fontSize: 15
                }}
            >
                Submit
            </button>
        </div>
    );
}