import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "./useAuth";
import { GoogleGenAI } from "@google/genai";
import { QUESTIONS } from "../utils/questions";
import { calculateAverageScore } from "../utils/avgHappiness";

export function useQuizForm() {
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

            const ai = new GoogleGenAI({ apiKey: process.env.REACT_APP_GEMINI_API_KEY });
            let recommendation = "Take a short breathing break and rest your mind today.";

            try {
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: `You are an empathetic wellness companion app AI. Analyze these daily mood quiz answers (scored 1 to 6, where 1 means strongly disagree and 6 means strongly agree):\n\n${quizSummaryString}\n\nProvide a single unified recommendation string (maximum 3 short sentences) highlighting an area I struggled with today and offering one simple, actionable self-care tip. Do not use clinical, scary, or medical jargon. Speak directly to me.`,
                });

                if (response.text) {
                    recommendation = response.text.trim();
                }
            } catch (apiErr) {
                console.error("SDK Request failed, using fallback text:", apiErr);
            }

            const quizPayload = {
                answers: answers.map((value, i) => ({ question: QUESTIONS[i], value })),
                avgScore: avg,
                recommendation,
            };

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

    return {
        answers,
        submitting,
        isButtonDisabled,
        handleSelect,
        handleSubmit
    };
}