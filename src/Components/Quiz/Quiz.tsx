import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../hooks/useAuth";

import { calculateAverageScore } from "../../utils/avgHappiness";
import { getRecommendation } from "../../utils/recommendation";
import { QUESTIONS } from "../../utils/questions";
import { SCALE_LABELS } from "../../utils/scale";
import { GoogleGenAI } from '@google/genai';

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
            const today = new Date().toISOString().split("T")[0];

            let quizSummaryString = "";
            answers.forEach((val, i) => {
                quizSummaryString += `Statement: "${QUESTIONS[i]}" - Response score: ${val}/5.\n`;
            });

            // 1. Initialize the SDK with your API key
            const ai = new GoogleGenAI({ apiKey: process.env.REACT_APP_GEMINI_API_KEY });

            let recommendation = "Take a short breathing break and rest your mind today."; // Friendly fallback

            try {
                // 2. Call the API using the official SDK wrapper (Fixes CORS!)
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: `You are an empathetic wellness companion app AI. Analyze these daily mood quiz answers (scored 1 to 6, where 1 means strongly disagree and 6 means strongly agree):\n\n${quizSummaryString}\n\nProvide a single unified recommendation string (maximum 3 short sentences) highlighting an area I struggled with today and offering one simple, actionable self-care tip. Do not use clinical, scary, or medical jargon. Speak directly to me.`,
                });

                if (response.text) {
                    recommendation = response.text.trim();
                }
            } catch (apiErr) {
                // If Google blocks the client-side key for security, it logs here
                console.error("SDK Request failed, using fallback text:", apiErr);
            }

            const quizPayload = {
                answers: answers.map((value, i) => ({ question: QUESTIONS[i], value })),
                avgScore: avg,
                recommendation,
            };

            // 3. Save the result down to your Firestore database
            await setDoc(doc(db, "users", user.uid, "dailyQuizzes", today), {
                ...quizPayload,
                createdAt: serverTimestamp()
            });

            localStorage.setItem(`quiz_${today}`, JSON.stringify(quizPayload));

            navigate("/quiz/completed");
        } catch (err) {
            console.error("Failed to process daily wellness quiz summary:", err);
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
                maxWidth: 1280,
                margin: "40px auto",
                padding: "0 20px",
                fontFamily: "system-ui, sans-serif",
            }}
        >
            <div
                style={{
                    background: "white",
                    borderRadius: 20,
                    padding: 32,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                }}
            >
                <div style={{ marginBottom: 32 }}>
                    <h1
                        style={{
                            margin: 0,
                            fontSize: 32,
                            fontWeight: 700,
                            color: "#1f2937",
                            textAlign: "center"
                        }}
                    >
                        Daily Mood Check-In
                    </h1>

                    <p
                        style={{
                            marginTop: 10,
                            color: "#6b7280",
                            fontSize: 15,
                            lineHeight: 1.6,
                            textAlign: "center"
                        }}
                    >
                        Answer each statement based on how you've felt today.
                    </p>
                </div>

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
                <div style={{textAlign: "center"}}>Choose how much you agree with each statement:</div>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: 12,
                        marginTop: 12,
                        fontSize: 13,
                    }}
                >
                    {SCALE_LABELS.map((label, i) => (
                        <span
                            key={i}
                            style={{
                                background: "#f3f4f6",
                                padding: "6px 12px",
                                borderRadius: 999,
                            }}
                        >
            {label}
        </span>
                    ))}
                </div>
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
                    <p
                        style={{
                            fontSize: 18,
                            fontWeight: 600,
                            marginBottom: 18,
                            textAlign: "center",
                            color: "#1f2937",
                        }}
                    >
                        {q}
                    </p>

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            gap: 14,
                            marginTop: 18,
                        }}
                    >
                        {[1, 2, 3, 4, 5, 6].map((num) => (
                            <button
                                key={num}
                                type="button"
                                onClick={() => handleSelect(i, num)}
                                style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 10,
                                    border: "1px solid #ddd",
                                    background:
                                        answers[i] === num
                                            ? num <= 2
                                                ? "#ff4d4f"
                                                : num === 3 || num === 4
                                                    ? "#faad14"
                                                    : "#52c41a"
                                            : "white",
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
                        maxWidth: 320,
                        margin: "24px auto 0",
                        display: "block",
                        padding: "16px 20px",
                        borderRadius: 14,
                        fontSize: 16,
                        fontWeight: 700,
                        border: "none",
                        background: isButtonDisabled ? "#d1d5db" : "#2563eb",
                        color: "white",
                        cursor: isButtonDisabled ? "not-allowed" : "pointer",
                    }}
                >
                    {submitting ? "Analyzing your responses..." : "Complete Check-In"}
                </button>
            </div></div>
    );
}
