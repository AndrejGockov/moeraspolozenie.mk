import React from "react";
import { useQuizForm } from "../../../hooks/useQuizForm";
import { QUESTIONS } from "../../../utils/questions";
import { SCALE_LABELS } from "../../../utils/scale";

export function Quiz() {
    const { answers, submitting, isButtonDisabled, handleSelect, handleSubmit } = useQuizForm();

    return (
        <div style={{ maxWidth: 1280, margin: "40px auto", padding: "0 20px", fontFamily: "system-ui, sans-serif" }}>
            <div style={{ background: "white", borderRadius: 20, padding: 32, boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
                <div style={{ marginBottom: 32 }}>
                    <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700, color: "#1f2937", textAlign: "center" }}>
                        Daily Wellness Quiz
                    </h1>
                    <p style={{ marginTop: 10, color: "#6b7280", fontSize: 15, lineHeight: 1.6, textAlign: "center" }}>
                        Answer each statement based on how you've felt today.
                    </p>
                </div>

                <div style={{ marginBottom: 25, color: "#666", fontSize: 13, lineHeight: 1.6, display: "grid", gap: 4 }}>
                    <div style={{ textAlign: "center" }}>Choose how much you agree with each statement:</div>
                    <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginTop: 12, fontSize: 13 }}>
                        {SCALE_LABELS.map((label, i) => (
                            <span key={i} style={{ background: "#f3f4f6", padding: "6px 12px", borderRadius: 999 }}>
                                {label}
                            </span>
                        ))}
                    </div>
                </div>

                {QUESTIONS.map((q, i) => (
                    <div key={i} style={{ marginBottom: 28, padding: 14, border: "1px solid #eee", borderRadius: 12, background: "#fafafa" }}>
                        <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 18, textAlign: "center", color: "#1f2937" }}>
                            {q}
                        </p>
                        <div style={{ display: "flex", justifyContent: "center", gap: 14, marginTop: 18 }}>
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
                                        background: answers[i] === num
                                            ? num <= 2 ? "#ff4d4f" : num === 3 || num === 4 ? "#faad14" : "#52c41a"
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
            </div>
        </div>
    );
}