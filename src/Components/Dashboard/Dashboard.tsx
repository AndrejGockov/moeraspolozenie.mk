import React, { useEffect, useState, useRef } from "react";
import { db } from "../../firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useAuth } from "../../hooks/useAuth";
import { useQuotes } from "../../Context/QuoteContext";
import { Pagination } from "../Pagination/Pagination";
import { BookmarkIcon } from "../BookmarkIcon/BookmarkIcon";


export function Dashboard() {
    const [tab, setTab] = useState<"stats" | "quotes" | "history">("stats");
    const [quizData, setQuizData] = useState<any[]>([]);
    const [expandedQuizId, setExpandedQuizId] = useState<string | null>(null);

    const { user, loading: authLoading } = useAuth();
    const { savedQuotes, loading: quotesLoading, removeSavedQuote } = useQuotes();
    const [localQuotes, setLocalQuotes] = useState<any[]>([]);
    const isFetched = useRef(false);
    const [modal, setModal] = useState<{ open: boolean; id: string; text: string; author: string }>({ open: false, id: "", text: "", author: "" });

    // Search states
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [timeFilter, setTimeFilter] = useState<"all" | "week" | "month">("all");
    const [quizSearchQuery, setQuizSearchQuery] = useState("");

    // Pagination states
    const [currentQuizPage, setCurrentQuizPage] = useState(1);
    const [currentQuotePage, setCurrentQuotePage] = useState(1);
    const itemsPerPage = 10;

    // Reset paginations when switching tabs
    useEffect(() => {
        setCurrentQuizPage(1);
        setCurrentQuotePage(1);
    }, [tab]);

    // Filtered Quotes
    const filteredQuotes = localQuotes.filter((q) => {
        const query = searchQuery.toLowerCase();
        const textMatches = q.text?.toLowerCase().includes(query);
        const authorMatches = q.author?.toLowerCase().includes(query);
        return textMatches || authorMatches;
    });

    // Filtered Quiz History
    const filteredQuizzes = quizData.filter((q) => {
        const recommendationMatch =
            !quizSearchQuery ||
            q.recommendation
                ?.toLowerCase()
                .includes(quizSearchQuery.toLowerCase());

        const quizDate = new Date(q.id);

        // Date takes priority over range filters
        if (selectedDate) {
            const formattedDate = quizDate.toISOString().split("T")[0];
            return (
                recommendationMatch &&
                formattedDate === selectedDate
            );
        }

        let dateMatch = true;

        if (timeFilter === "week") {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            dateMatch = quizDate >= sevenDaysAgo;
        }

        if (timeFilter === "month") {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            dateMatch = quizDate >= thirtyDaysAgo;
        }

        return recommendationMatch && dateMatch;
    });

    useEffect(() => {
        if (savedQuotes) {
            setLocalQuotes(savedQuotes);
        }
    }, [savedQuotes]);

    useEffect(() => {
        if (authLoading || !user || isFetched.current) return;

        const loadQuizHistory = async () => {
            try {
                const quizSnap = await getDocs(
                    collection(db, "users", user.uid, "dailyQuizzes")
                );
                const quizzes: any[] = [];
                quizSnap.forEach((d) => {
                    if (d.exists()) {
                        quizzes.push({ id: d.id, ...d.data() });
                    }
                });
                setQuizData(quizzes);
                isFetched.current = true;
            } catch (err) {
                console.error("Error loading quiz data:", err);
            }
        };
        loadQuizHistory();
    }, [user, authLoading]);

    const confirmDeleteQuote = async () => {
        const targetId = modal.id;
        if (!user || !targetId) return;

        try {
            await deleteDoc(doc(db, "users", user.uid, "savedQuotes", targetId));
            setLocalQuotes((prev) => prev.filter((q) => q.date !== targetId && q.id !== targetId));
            localStorage.removeItem(`savedQuote_${user.uid}_${targetId}`);
            removeSavedQuote(targetId);

            // Adjust page index if deleting the last item on the current page
            const remainingFilteredCount = filteredQuotes.length - 1;
            const maxRemainingPages = Math.ceil(remainingFilteredCount / itemsPerPage);
            if (currentQuotePage > maxRemainingPages && maxRemainingPages > 0) {
                setCurrentQuotePage(maxRemainingPages);
            }
        } catch (err) {
            console.error("Error deleting quote:", err);
        } finally {
            setModal({ open: false, id: "", text: "", author: "" });
        }
    };

    const scores = quizData
        .map((q) => q.avgScore)
        .filter((v): v is number => typeof v === "number");

    const hasScores = scores.length > 0;
    const avg = hasScores ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const lowest = hasScores ? Math.min(...scores) : 0;
    const highest = hasScores ? Math.max(...scores) : 0;

    // Weekly avg
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const weeklyScores = quizData
        .filter((q) => {
            const quizDate = new Date(q.id);
            return quizDate >= sevenDaysAgo && typeof q.avgScore === "number";
        })
        .map((q) => q.avgScore);

    const hasWeeklyScores = weeklyScores.length > 0;
    const weeklyAvg = hasWeeklyScores
        ? weeklyScores.reduce((a, b) => a + b, 0) / weeklyScores.length
        : null;

    // Monthly avg
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const monthlyScores = quizData
        .filter((q) => {
            const quizDate = new Date(q.id);
            return quizDate >= thirtyDaysAgo && typeof q.avgScore === "number";
        })
        .map((q) => q.avgScore);

    const hasMonthlyScores = monthlyScores.length > 0;
    const monthlyAvg = hasMonthlyScores
        ? monthlyScores.reduce((a, b) => a + b, 0) / monthlyScores.length
        : null;

    const sad = scores.filter(s => s <= 2).length;
    const neutral = scores.filter(s => s > 2 && s < 4).length;
    const happy = scores.filter(s => s >= 4).length;

    const pieData = [
        { name: "Sad days", value: sad, fill: "#ff4d4f" },
        { name: "Neutral days", value: neutral, fill: "#ffa940" },
        { name: "Happy days", value: happy, fill: "#52c41a" }
    ].filter(item => item.value > 0);

    // Pagination Calculations for Quizzes
    const totalQuizPages = Math.ceil(filteredQuizzes.length / itemsPerPage);
    const indexOfLastQuiz = currentQuizPage * itemsPerPage;
    const indexOfFirstQuiz = indexOfLastQuiz - itemsPerPage;
    const currentQuizzes = filteredQuizzes.slice(indexOfFirstQuiz, indexOfLastQuiz);

    // Pagination Calculations for Quotes
    const totalQuotePages = Math.ceil(filteredQuotes.length / itemsPerPage);
    const indexOfLastQuote = currentQuotePage * itemsPerPage;
    const indexOfFirstQuote = indexOfLastQuote - itemsPerPage;
    const currentQuotes = filteredQuotes.slice(indexOfFirstQuote, indexOfLastQuote);

    return (
        <div style={{ width: "100%", maxWidth: 900, margin: "0 auto", padding: "20px" }}>
            <div style={{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", minHeight: 650, boxSizing: "border-box" }}>
                <h1 style={{ fontWeight: 400, margin: 0, fontSize: 28 }}>
                    {user?.displayName || "User"}{" "}
                    <span style={{ fontSize: 14, color: "#777", fontWeight: 400 }}>
                        ({user?.email})
                    </span>
                </h1>

                <hr style={{ border: "none", borderTop: "1px solid #eee", margin: "16px 0 24px" }} />

                <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
                    <button
                        onClick={() => setTab("stats")}
                        style={{ padding: "10px 16px", borderRadius: 8, border: "none", cursor: "pointer", background: tab === "stats" ? "#007bff" : "#eee", color: tab === "stats" ? "white" : "#333", fontWeight: 600 }}
                    >
                        Mood Statistics
                    </button>
                    <button
                        onClick={() => setTab("quotes")}
                        style={{ padding: "10px 16px", borderRadius: 8, border: "none", cursor: "pointer", background: tab === "quotes" ? "#007bff" : "#eee", color: tab === "quotes" ? "white" : "#333", fontWeight: 600 }}
                    >
                        Saved Quotes
                    </button>
                    <button
                        onClick={() => setTab("history")}
                        style={{ padding: "10px 16px", borderRadius: 8, border: "none", cursor: "pointer", background: tab === "history" ? "#007bff" : "#eee", color: tab === "history" ? "white" : "#333", fontWeight: 600 }}
                    >
                        Quiz History
                    </button>
                </div>

                <div style={{ minHeight: 480 }}>
                    {tab === "stats" && (
                        <div>
                            <h2 style={{ fontSize: 20, marginBottom: 16 }}>Mood quiz statistics:</h2>
                            {quizData.length > 0 ? (
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "center" }}>
                                    <div style={{ width: "100%", height: 340, position: "relative" }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90} stroke="none">
                                                    {pieData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>

                                    <div style={{ lineHeight: "2.2", fontSize: 16, textAlign: "left" }}>
                                        <hr style={{ border: "none", borderTop: "1px solid #edf2f7", margin: "12px 0" }} />
                                        <p style={{ margin: 0 }}>
                                            Weekly average (last 7 days):{" "}
                                            <b style={{ color: weeklyAvg && weeklyAvg >= 4 ? "#52c41a" : weeklyAvg && weeklyAvg <= 2 ? "#ff4d4f" : "#fa8c16" }}>
                                                {weeklyAvg ? `${weeklyAvg.toFixed(2)} / 5` : "No logs this week"}
                                            </b>
                                        </p>
                                        <p style={{ margin: 0 }}>
                                            Monthly average (30 days):{" "}
                                            <b style={{ color: monthlyAvg && monthlyAvg >= 4 ? "#52c41a" : monthlyAvg && monthlyAvg <= 2 ? "#ff4d4f" : "#fa8c16" }}>
                                                {monthlyAvg ? `${monthlyAvg.toFixed(2)} / 5` : "No logs"}
                                            </b>
                                        </p>
                                        <p style={{ margin: 0 }}>All time average: <b style={{ color: "#007bff" }}>{avg.toFixed(2)} / 5</b></p>
                                        <p style={{ margin: 0 }}>Highest quiz score: <b>{highest}</b></p>
                                        <p style={{ margin: 0 }}>Lowest quiz score: <b>{lowest}</b></p>
                                        <p style={{ margin: 0 }}>Total tests taken: <b>{quizData.length}</b></p>
                                    </div>

                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "center",
                                            gap: 24,
                                            flexWrap: "wrap",
                                            marginTop: 12,
                                            fontWeight: 600,
                                            fontSize: 15,
                                        }}
                                    >
                                        <span style={{ color: "#52c41a" }}>● Happy Days: {happy}</span>
                                        <span style={{ color: "#ffa940" }}>● Neutral Days: {neutral}</span>
                                        <span style={{ color: "#ff4d4f" }}>● Sad Days: {sad}</span>
                                    </div>
                                </div>
                            ) : (
                                <p style={{ color: "#777", textAlign: "left" }}>No mood data yet. Take the daily quiz to start tracking your mood charts!</p>
                            )}
                        </div>
                    )}

                    {tab === "quotes" && (
                        <div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
                                <h2 style={{ fontSize: 20, margin: 0, fontWeight: 600, color: "#1a1a1a" }}>
                                    Your Saved Quotes
                                    <span style={{ fontSize: 14, color: "#777", fontWeight: 400, marginLeft: 8 }}>
                                        ({filteredQuotes.length} {filteredQuotes.length === 1 ? "quote" : "quotes"} found)
                                    </span>
                                </h2>

                                {localQuotes.length > 0 && (
                                    <input
                                        type="text"
                                        placeholder="Search quotes or authors..."
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            setCurrentQuotePage(1);
                                        }}
                                        style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, width: "100%", maxWidth: 280, outline: "none", boxSizing: "border-box" }}
                                    />
                                )}
                            </div>

                            {quotesLoading && localQuotes.length === 0 ? (
                                <p style={{ color: "#777", textAlign: "left" }}>Loading saved dashboard entries...</p>
                            ) : localQuotes.length > 0 ? (
                                filteredQuotes.length > 0 ? (
                                    <>
                                        <div style={{ display: "grid", gap: 16 }}>
                                            {currentQuotes.map((q, idx) => (
                                                <div key={q.date || q.id || idx} style={{ padding: 16, border: "1px solid #eee", borderRadius: 12, background: "#fafafa", display: "flex", justifyContent: "space-between", alignItems: "center", boxSizing: "border-box" }}>
                                                    <div style={{ paddingRight: 20, textAlign: "left" }}>
                                                        <p style={{ margin: "0 0 6px 0", fontStyle: "italic", fontSize: 15, color: "#2d3748" }}>"{q.text}"</p>
                                                        <small style={{ color: "#4a5568", fontWeight: 600 }}>— {q.author || "Anonymous"}</small>
                                                    </div>
                                                    <button
                                                        onClick={() =>
                                                            setModal({
                                                                open: true,
                                                                id: q.date || q.id || "",
                                                                text: q.text,
                                                                author: q.author || "Anonymous",
                                                            })
                                                        }
                                                        title="Remove bookmark"
                                                        aria-label="Remove bookmark"
                                                        style={{
                                                            background: "transparent",
                                                            border: "none",
                                                            cursor: "pointer",
                                                            color: "#1890ff",
                                                            padding: 4,
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            flexShrink: 0,
                                                        }}
                                                    >
                                                        <BookmarkIcon
                                                            filled
                                                            className="bookmark-icon"
                                                        />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        {/* Reusable Quotes Pagination */}
                                        <Pagination
                                            currentPage={currentQuotePage}
                                            totalPages={totalQuotePages}
                                            onPageChange={setCurrentQuotePage}
                                        />
                                    </>
                                ) : (
                                    <p style={{ color: "#777", textAlign: "left", marginTop: 20 }}>No quotes match your search term.</p>
                                )
                            ) : (
                                <p style={{ color: "#777", textAlign: "left" }}>You haven't saved any quotes to your dashboard yet.</p>
                            )}
                        </div>
                    )}

                    {tab === "history" && (
                        <div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
                                <h2 style={{ fontSize: 20, margin: 0, fontWeight: 600, color: "#1a1a1a", textAlign: "left" }}>
                                    Check-up History
                                    <span style={{ fontSize: 14, color: "#777", fontWeight: 400, marginLeft: 8 }}>
                                        ({filteredQuizzes.length} {filteredQuizzes.length === 1 ? "log" : "logs"} found)
                                    </span>
                                </h2>

                                {quizData.length > 0 && (
                                    <div
                                        style={{
                                            display: "flex",
                                            gap: 12,
                                            flexWrap: "wrap",
                                            alignItems: "center",
                                        }}
                                    >
                                        <select
                                            value={timeFilter}
                                            onChange={(e) => {
                                                setTimeFilter(
                                                    e.target.value as "all" | "week" | "month"
                                                );
                                                setCurrentQuizPage(1);
                                            }}
                                            style={{
                                                padding: "8px 14px",
                                                borderRadius: 8,
                                                border: "1px solid #e2e8f0",
                                                fontSize: 14,
                                                background: "white",
                                                cursor: "pointer",
                                            }}
                                        >
                                            <option value="all">All Time</option>
                                            <option value="week">Last Week</option>
                                            <option value="month">Last Month</option>
                                        </select>

                                        <input
                                            type="text"
                                            placeholder="Search recommendation..."
                                            value={quizSearchQuery}
                                            onChange={(e) => {
                                                setQuizSearchQuery(e.target.value);
                                                setCurrentQuizPage(1);
                                            }}
                                            style={{
                                                padding: "8px 14px",
                                                borderRadius: 8,
                                                border: "1px solid #e2e8f0",
                                                fontSize: 14,
                                                width: "100%",
                                                maxWidth: 385,
                                                outline: "none",
                                                boxSizing: "border-box",
                                            }}
                                        />
                                        At date:<input
                                            type="date"
                                            value={selectedDate}
                                            onChange={(e) => {
                                                setSelectedDate(e.target.value);
                                                setTimeFilter("all");
                                                setCurrentQuizPage(1);
                                            }}
                                            style={{
                                                padding: "8px 14px",
                                                borderRadius: 8,
                                                border: "1px solid #e2e8f0",
                                                fontSize: 14,
                                                background: "white",
                                                color: "#2d3748",
                                                outline: "none",
                                                cursor: "pointer",
                                                minWidth: 170,
                                                boxSizing: "border-box",
                                            }}
                                        />

                                    </div>
                                )}
                            </div>

                            {quizData.length > 0 ? (
                                filteredQuizzes.length > 0 ? (
                                    <>
                                        <div style={{ display: "grid", gap: 14 }}>
                                            {currentQuizzes.map((q) => {
                                                const isExpanded = expandedQuizId === q.id;
                                                const isHappy = q.avgScore >= 4;
                                                const isSad = q.avgScore <= 2;

                                                const themeColor = isHappy ? "#52c41a" : isSad ? "#ff4d4f" : "#ffa940";
                                                const themeBg = isHappy ? "#f6ffed" : isSad ? "#fff1f0" : "#fff7e6";

                                                return (
                                                    <div
                                                        key={q.id}
                                                        style={{
                                                            padding: "18px 20px",
                                                            border: "1px solid #eef2f5",
                                                            borderRadius: 14,
                                                            background: "white",
                                                            display: "flex",
                                                            flexDirection: "column",
                                                            gap: 14,
                                                            cursor: "pointer",
                                                            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.01)",
                                                            borderLeft: `5px solid ${themeColor}`,
                                                            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                                                            boxSizing: "border-box"
                                                        }}
                                                        onClick={() => setExpandedQuizId(isExpanded ? null : q.id)}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.transform = "translateY(-1px)";
                                                            e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0,0,0,0.04), 0 4px 6px -2px rgba(0,0,0,0.02)";
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.transform = "translateY(0)";
                                                            e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.01)";
                                                        }}
                                                    >
                                                        {/* Summary row */}
                                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                                                            <div style={{ textAlign: "left" }}>
                                                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                                    <span style={{ fontWeight: 700, fontSize: 16, color: "#2d3748" }}>{q.id}</span>
                                                                    <span style={{ fontSize: 12, color: "#a0aec0", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>▼</span>
                                                                </div>
                                                                <p style={{ margin: "6px 0 0 0", color: "#4a5568", fontSize: 14, lineHeight: "1.4" }}>
                                                                    <span style={{ color: "#718096", fontWeight: 500 }}>Recommendation:</span> {q.recommendation}
                                                                </p>
                                                            </div>
                                                            <div style={{
                                                                background: themeBg,
                                                                color: themeColor,
                                                                padding: "6px 14px",
                                                                borderRadius: 30,
                                                                fontWeight: 700,
                                                                fontSize: 14,
                                                                border: `1px solid ${themeColor}22`
                                                            }}>
                                                                Score: {typeof q.avgScore === "number" ? q.avgScore.toFixed(1) : q.avgScore}
                                                            </div>
                                                        </div>

                                                        {/* Expanded Breakdown */}
                                                        {isExpanded && (
                                                            <div
                                                                style={{
                                                                    marginTop: 6,
                                                                    paddingTop: 18,
                                                                    borderTop: "1px solid #edf2f7",
                                                                    display: "grid",
                                                                    gap: 12
                                                                }}
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <h4 style={{ margin: "0 0 4px 0", color: "#2d3748", textAlign: "left", fontSize: 14, fontWeight: 700, letterSpacing: "0.3px", textTransform: "uppercase" }}>
                                                                    Question Log Details
                                                                </h4>
                                                                <div style={{ display: "grid", gap: 10 }}>
                                                                    {q.answers?.map((item: any, idx: number) => (
                                                                        <div key={idx} style={{ background: "#f8fafc", padding: "14px 16px", borderRadius: 10, border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", boxSizing: "border-box" }}>
                                                                            <p style={{ margin: 0, fontWeight: 500, color: "#4a5568", fontSize: 14, textAlign: "left", paddingRight: 20 }}>
                                                                                {item.question}
                                                                            </p>
                                                                            <span style={{
                                                                                background: item.value >= 4 ? "#e6f7ff" : item.value <= 2 ? "#fff1f0" : "#fff7e6",
                                                                                color: item.value >= 4 ? "#1890ff" : item.value <= 2 ? "#ff4d4f" : "#fa8c16",
                                                                                fontWeight: 700,
                                                                                fontSize: 13,
                                                                                minWidth: 28,
                                                                                height: 28,
                                                                                borderRadius: "50%",
                                                                                display: "flex",
                                                                                alignItems: "center",
                                                                                justifyContent: "center",
                                                                                border: "1px solid currentColor"
                                                                            }}>
                                                                                {item.value}
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        {/* Reusable Quiz History Pagination */}
                                        <Pagination
                                            currentPage={currentQuizPage}
                                            totalPages={totalQuizPages}
                                            onPageChange={setCurrentQuizPage}
                                        />
                                    </>
                                ) : (
                                    <p style={{ color: "#777", textAlign: "left", marginTop: 20 }}>No logs match your search term.</p>
                                )
                            ) : (
                                <p style={{ color: "#777", textAlign: "left" }}>No history log entries found.</p>
                            )}
                        </div>
                    )}

                </div>
            </div>

            {/* Modal */}
            {modal.open && (
                <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0, 0, 0, 0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 20, boxSizing: "border-box" }}>
                    <div style={{ background: "white", width: "100%", maxWidth: 480, borderRadius: 16, padding: 24, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)", textAlign: "center", boxSizing: "border-box" }}>
                        <h3 style={{ margin: "0 0 10px 0", fontSize: 20, fontWeight: 700, color: "#1a1a1a" }}>Delete Quote?</h3>
                        <p style={{ margin: "0 0 20px 0", color: "#666", fontSize: 14, lineHeight: "1.5" }}>Are you sure you want to remove this quote from your dashboard?</p>
                        <div style={{ background: "#f8fafc", padding: 14, borderRadius: 12, border: "1px solid #edf2f7", fontStyle: "italic", fontSize: 14, color: "#4a5568", marginBottom: 24, textAlign: "left" }}>
                            "{modal.text}" <br />
                            <small style={{ fontStyle: "normal", fontWeight: 600, color: "#718096", display: "block", marginTop: 4 }}>— {modal.author}</small>
                        </div>
                        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                            <button
                                onClick={() => setModal({ open: false, id: "", text: "", author: "" })}
                                style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #e2e8f0", background: "white", color: "#4a5568", cursor: "pointer", fontWeight: 600, fontSize: 14 }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteQuote}
                                style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#ff4d4f", color: "white", cursor: "pointer", fontWeight: 600, fontSize: 14 }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}