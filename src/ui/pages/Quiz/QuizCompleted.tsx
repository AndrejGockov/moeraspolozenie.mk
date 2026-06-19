import React from "react";
import { useCompletedQuizData } from "../../../hooks/useCompletedQuizData";

export function QuizCompleted() {
    const { data, timeLeft, isLoadingData } = useCompletedQuizData();

    return (
        <div
            style={{
                width: 700,
                background: "white",
                borderRadius: 16,
                padding: 28,
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                textAlign: "center",
                boxSizing: "border-box",
                position: "relative",
                zIndex: 1
            }}
        >
            <h1>You have completed today's wellness quiz! 🎉</h1>

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
                    Your wellness score today is:<br />
                    {isLoadingData ? "..." : `${data.avgScore} / 6`}
                </h2>

                <p style={{ fontSize: 16, marginBottom: 15 }}>
                    {isLoadingData ? "Loading personalized recommendation..." : data.recommendation}
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
                    Next quiz opens in: {timeLeft.hours}h {timeLeft.minutes}m
                </div>
            </div>
        </div>
    );
}