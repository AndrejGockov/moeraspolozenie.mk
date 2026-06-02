import React, { useEffect, useState } from "react";
import { auth, db } from "../../firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { PieChart, Pie, ResponsiveContainer } from "recharts";

export function Dashboard() {
    const [tab, setTab] = useState<"stats" | "quotes">("stats");
    const [quizData, setQuizData] = useState<any[]>([]);
    const [quotes, setQuotes] = useState<any[]>([]);

    const user = auth.currentUser;

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
        const user = auth.currentUser;
        if (!user) return;

        const ok = window.confirm(
            `Delete this quote?\n\n"${text}" — ${author}`
        );

        if (!ok) return;

        await deleteDoc(doc(db, "users", user.uid, "savedQuotes", id));
        setQuotes((prev) => prev.filter((q) => q.id !== id));
    };

    const scores = quizData.map((q) => q.avgScore || 0);

    const avg = scores.reduce((a, b) => a + b, 0) / (scores.length || 1);
    const lowest = scores.length ? Math.min(...scores) : 0;
    const highest = scores.length ? Math.max(...scores) : 0;

    const sad = scores.filter(s => s <= 2).length;
    const neutral = scores.filter(s => s > 2 && s < 4).length;
    const happy = scores.filter(s => s >= 4).length;

    const pieData = [
        { name: "Sad 😔", value: sad || 0.01, fill: "#ff4d4f" },
        { name: "Neutral 😐", value: neutral || 0.01, fill: "#ffa940" },
        { name: "Happy 🙂", value: happy || 0.01, fill: "#52c41a" }
    ];

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#f5f7fb",
                padding: 30
            }}
        >
            {/* FIXED APP PANEL */}
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
                {/* HEADER */}
                <h1 style={{ fontWeight: 400 }}>
                    {auth.currentUser?.displayName}{" "}
                    <span style={{ fontSize: 14, color: "#777" }}>
                        ({auth.currentUser?.email})
                    </span>
                </h1>

                <hr style={{ border: "none", borderTop: "1px solid #eee", margin: "12px 0 20px" }} />

                {/* TOGGLES */}
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
                        Profile Statistics
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
                        My Saved Quotes
                    </button>
                </div>

                {/* FIXED CONTENT AREA (NO LAYOUT SHIFT EVER) */}
                <div style={{ minHeight: 520 }}>

                    {tab === "stats" && (
                        <div>
                            <h2>Mood Quiz Statistics</h2>

                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "320px 1fr 1fr",
                                    gap: 30,
                                    alignItems: "center",
                                    marginTop: 20
                                }}
                            >
                                {/* PIE */}
                                <div style={{ width: 320, height: 320 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                dataKey="value"
                                                nameKey="name"
                                                outerRadius={110}
                                                paddingAngle={3}
                                                label={false}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* LEGEND */}
                                <div style={{ fontSize: 14 }}>
                                    <p>🟢 Happy 🙂</p>
                                    <p>🟠 Neutral 😐</p>
                                    <p>🔴 Sad 😔</p>
                                </div>

                                {/* STATS */}
                                <div style={{ lineHeight: 2 }}>
                                    <p>All time average: {avg.toFixed(2)}</p>
                                    <p>Monthly average: {avg.toFixed(2)}</p>
                                    <p>Lowest score: {lowest}</p>
                                    <p>Highest score: {highest}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {tab === "quotes" && (
                        <div>
                            <h2>Saved Quotes</h2>

                            {quotes.length === 0 && (
                                <p style={{ color: "#777" }}>
                                    No saved quotes yet.
                                </p>
                            )}

                            <div style={{ marginTop: 20 }}>
                                {quotes.map((q) => (
                                    <div
                                        key={q.id}
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            padding: 14,
                                            border: "1px solid #eee",
                                            borderRadius: 12,
                                            background: "#fafafa",
                                            marginBottom: 10
                                        }}
                                    >
                                        <p style={{ fontStyle: "italic", margin: 0 }}>
                                            “{q.text}”{" "}
                                            <span style={{ color: "#888" }}>
                                                — {q.author}
                                            </span>
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

                </div>
            </div>
        </div>
    );
}