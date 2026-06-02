import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import {
    collection,
    getDocs,
    deleteDoc,
    doc
} from "firebase/firestore";
import { PieChart, Pie, ResponsiveContainer } from "recharts";
import { useAuth } from "../../hooks/useAuth";

export function Dashboard() {
    const [tab, setTab] = useState<"stats" | "quotes" | "history" | "review">("stats");
    const [quizData, setQuizData] = useState<any[]>([]);
    const [quotes, setQuotes] = useState<any[]>([]);
    const [selectedQuiz, setSelectedQuiz] = useState<any | null>(null);

    const { user } = useAuth();

    useEffect(() => {
        const loadData = async () => {
            if (!user) return;

            const quizSnap = await getDocs(
                collection(db, "users", user.uid, "dailyQuizzes")
            );

            const quizzes: any[] = [];
            quizSnap.forEach((d) =>
                quizzes.push({ id: d.id, ...d.data() })
            );
            setQuizData(quizzes);

            const quoteSnap = await getDocs(
                collection(db, "users", user.uid, "savedQuotes")
            );

            const saved: any[] = [];
            quoteSnap.forEach((d) =>
                saved.push({ id: d.id, ...d.data() })
            );
            setQuotes(saved);
        };

        loadData();
    }, [user]);

    const deleteQuote = async (id: string, text: string, author: string) => {
        if (!user) return;

        const ok = window.confirm(
            `Delete this quote?\n\n"${text}" — ${author}`
        );

        if (!ok) return;

        await deleteDoc(
            doc(db, "users", user.uid, "savedQuotes", id)
        );

        setQuotes((prev) => prev.filter((q) => q.id !== id));
    };

    const scores = quizData
        .map((q) => q.avgScore)
        .filter((v): v is number => typeof v === "number");

    const hasScores = scores.length > 0;

    const avg = hasScores
        ? scores.reduce((a, b) => a + b, 0) / scores.length
        : null;

    const lowest = hasScores ? Math.min(...scores) : null;
    const highest = hasScores ? Math.max(...scores) : null;

    const sad = scores.filter(s => s <= 2).length;
    const neutral = scores.filter(s => s > 2 && s < 4).length;
    const happy = scores.filter(s => s >= 4).length;

    const rawData = [
        { name: "Sad 😔", value: sad, fill: "#ff4d4f" },
        { name: "Neutral 😐", value: neutral, fill: "#ffa940" },
        { name: "Happy 🙂", value: happy, fill: "#52c41a" }
    ];

    const pieData = rawData.filter(item => item.value > 0);
    const hasData = pieData.length > 0;

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#f5f7fb",
                padding: 30
            }}
        >
            <div
                style={{
                    width: 900,
                    margin: "0 auto",
                    background: "white",
                    borderRadius: 16,
                    padding: 24,
                    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                    minHeight: 650
                }}
            >
                <h1 style={{ fontWeight: 400 }}>
                    {user?.displayName}{" "}
                    <span style={{ fontSize: 14, color: "#777" }}>
                        ({user?.email})
                    </span>
                </h1>

                <hr style={{
                    border: "none",
                    borderTop: "1px solid #eee",
                    margin: "12px 0 20px"
                }} />

                {/* TABS */}
                <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                    <button
                        onClick={() => setTab("stats")}
                        style={{
                            padding: "10px 16px",
                            borderRadius: 8,
                            border: "none",
                            cursor: "pointer",
                            background: tab === "stats" ? "#007bff" : "#eee",
                            color: tab === "stats" ? "white" : "#333",
                            fontWeight: 600
                        }}
                    >
                        Mood Statistics
                    </button>

                    <button
                        onClick={() => setTab("quotes")}
                        style={{
                            padding: "10px 16px",
                            borderRadius: 8,
                            border: "none",
                            cursor: "pointer",
                            background: tab === "quotes" ? "#007bff" : "#eee",
                            color: tab === "quotes" ? "white" : "#333",
                            fontWeight: 600
                        }}
                    >
                        Saved Quotes
                    </button>

                    <button
                        onClick={() => setTab("history")}
                        style={{
                            padding: "10px 16px",
                            borderRadius: 8,
                            border: "none",
                            cursor: "pointer",
                            background: tab === "history" ? "#007bff" : "#eee",
                            color: tab === "history" ? "white" : "#333",
                            fontWeight: 600
                        }}
                    >
                        Quiz History
                    </button>
                </div>

                <div style={{ minHeight: 520 }}>

                    {/* STATS */}
                    {tab === "stats" && (
                        <div>
                            <h2>Mood quiz statistics:</h2>

                            {hasData ? (
                                <div style={{
                                    display: "grid",
                                    gridTemplateColumns: "320px 1fr 1fr",
                                    gap: 30,
                                    alignItems: "center",
                                    marginTop: 20
                                }}>
                                    <div style={{ width: 320, height: 320 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={pieData}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    outerRadius={110}
                                                    stroke="none"
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>

                                    <div style={{ fontSize: 14 }}>
                                        <p>🟢 Happy days</p>
                                        <p>🟠 Neutral days</p>
                                        <p>🔴 Depressed days</p>
                                    </div>

                                    <div style={{ lineHeight: 2 }}>
                                        <p>All time average: {(avg as number)?.toFixed(2)}</p>
                                        <p>Lowest score: {lowest}</p>
                                        <p>Highest score: {highest}</p>
                                    </div>
                                </div>
                            ) : (
                                <p style={{ color: "#777", marginTop: 20 }}>
                                    No mood data yet, take the daily quiz to start tracking your mood chart!
                                </p>
                            )}
                        </div>
                    )}

                    {tab === "quotes" && (
                        <div>
                            <h2>Saved Quotes</h2>

                            {quotes.length === 0 && (
                                <p style={{ color: "#777" }}>
                                    You haven't saved any quotes yet. Check today's quote to save a daily quote!
                                </p>
                            )}

                            <div style={{ marginTop: 20 }}>
                                {quotes.map((q) => (
                                    <div
                                        key={q.id}
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            padding: 14,
                                            border: "1px solid #eee",
                                            borderRadius: 12,
                                            background: "#fafafa",
                                            marginBottom: 10
                                        }}
                                    >
                                        <p style={{ margin: 0 }}>
                                            “{q.text}” — {q.author}
                                        </p>

                                        <button
                                            onClick={() =>
                                                deleteQuote(q.id, q.text, q.author)
                                            }
                                            style={{
                                                background: "none",
                                                border: "none",
                                                color: "#dc3545",
                                                cursor: "pointer",
                                                fontWeight: 600
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* HISTORY */}
                    {tab === "history" && (
                        <div>
                            <h2>Quiz History</h2>

                            {quizData.length === 0 ? (
                                <p style={{ color: "#777" }}>
                                    You haven't taken a mood quiz yet. Check your daily mood today!
                                </p>
                            ) : (
                                <div style={{ marginTop: 20 }}>
                                    {quizData.map((q) => (
                                        <div
                                            key={q.id}
                                            onClick={() => {
                                                setSelectedQuiz(q);
                                                setTab("review");
                                            }}
                                            style={{
                                                padding: 14,
                                                border: "1px solid #eee",
                                                borderRadius: 12,
                                                background: "#fafafa",
                                                marginBottom: 10,
                                                cursor: "pointer"
                                            }}
                                        >
                                            <div style={{ fontWeight: 600 }}>
                                                {q.id}
                                            </div>

                                            <div style={{ fontSize: 13, color: "#777" }}>
                                                Score: {q.avgScore}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* REVIEW */}
                    {tab === "review" && selectedQuiz && (
                        <div>
                            <button
                                onClick={() => setTab("history")}
                                style={{
                                    marginBottom: 20,
                                    background: "none",
                                    border: "none",
                                    color: "#007bff",
                                    cursor: "pointer",
                                    fontWeight: 600
                                }}
                            >
                                ← Back to list
                            </button>

                            <h2>Quiz Review</h2>

                            <div style={{
                                marginTop: 20,
                                padding: 20,
                                borderRadius: 12,
                                border: "1px solid #eee",
                                background: "#fafafa"
                            }}>
                                <p><b>Score:</b> {selectedQuiz.avgScore} / 5</p>

                                <p style={{ marginTop: 10 }}>
                                    {selectedQuiz.recommendation}
                                </p>

                                <hr style={{ margin: "15px 0" }} />

                                <h3>Question answers</h3>

                                {selectedQuiz.answers?.map((a: any, i: number) => (
                                    <div
                                        key={i}
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            padding: "6px 0"
                                        }}
                                    >
                                        <span>{a.question}</span>
                                        <b>{a.value}/5</b>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}