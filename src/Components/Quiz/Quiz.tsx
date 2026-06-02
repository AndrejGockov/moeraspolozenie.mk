import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../hooks/useAuth";

import { calculateAverageScore } from "../../utils/avgHappiness";
import { getRecommendation } from "../../utils/recommendation";
import { QUESTIONS } from "../../utils/questions";
import { SCALE_LABELS } from "../../utils/scale";

export function Quiz() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [answers, setAnswers] = useState<number[]>(
        Array(QUESTIONS.length).fill(0)
    );
    const [submitting, setSubmitting] = useState(false);

    const handleSelect = (index: number, value: number) => {
        const updated = [...answers];
        updated[index] = value;
        setAnswers(updated);
    };

    const handleSubmit = async () => {
        if (!user || submitting) return;

        try {
            setSubmitting(true);

            const avg = calculateAverageScore(answers);
            const recommendation = getRecommendation(avg);
            const today = new Date().toISOString().split("T")[0];

            const quizPayload = {
                answers: answers.map((value, i) => ({ question: QUESTIONS[i], value })),
                avgScore: avg,
                recommendation
            };

            await setDoc(doc(db, "users", user.uid, "dailyQuizzes", today), {
                answers: answers.map((value, i) => ({
                    question: QUESTIONS[i],
                    value
                })),
                avgScore: avg,
                recommendation,
                createdAt: serverTimestamp()
            });

            localStorage.setItem(`quiz_${today}`, JSON.stringify(quizPayload));
            navigate("/quiz/completed");
        } catch (err) {
            console.error("Failed to save quiz results:", err);
            alert("Something went wrong saving your quiz. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const isComplete = answers.every((a) => a > 0);
    const isButtonDisabled = !isComplete || submitting;

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
                                type="button"
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
                                    transition: "background 0.2s ease"
                                }}
                            >
                                {num}
                            </button>
                        ))}
                    </div>
                </div>
            ))}

            <button
                type="button"
                onClick={handleSubmit}
                disabled={isButtonDisabled}
                style={{
                    width: "100%",
                    padding: 14,
                    marginTop: 10,
                    background: isButtonDisabled ? "#ccc" : "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: 10,
                    cursor: isButtonDisabled ? "not-allowed" : "pointer",
                    fontWeight: 600,
                    fontSize: 15
                }}
            >
                {submitting ? "Submitting..." : "Submit"}
            </button>
        </div>
    );
}
