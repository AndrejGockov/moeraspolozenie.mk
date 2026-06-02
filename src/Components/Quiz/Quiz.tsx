import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { calculateAverageScore } from "../../utils/avgHappiness";
import { getRecommendation } from "../../utils/recommendation";
import { QUESTIONS } from "../../utils/questions";
import { SCALE_LABELS } from "../../utils/scale";


export function Quiz() {
    const navigate = useNavigate();

    const [checking, setChecking] = useState(true);
    const [answers, setAnswers] = useState<number[]>(Array(10).fill(0));


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
            answers: answers.map((value, i) => ({
                question: QUESTIONS[i],
                value
            })),
            avgScore: avg,
            recommendation,
            createdAt: serverTimestamp()
        });

        navigate("/quiz/completed");
    };

    const isComplete = answers.every((a) => a > 0);

    if (checking) {
        return (
            <div style={{ padding: 20, textAlign: "center" }}>
                Checking if you have already completed today's quiz...
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
            <h1 style={{ marginBottom: 10 }}>Daily Mood Quiz</h1>

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
                <div>Choose how much you agree with each statement:</div>
                {SCALE_LABELS.map((l, i) => (
                    <div key={i}>{l}</div>
                ))}
            </div>

            {QUESTIONS.map((q, i) => (
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