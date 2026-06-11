import React, { useEffect, useState, useRef } from "react";
import { db } from "../../../firebase";
import { collection, getDocs } from "firebase/firestore";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useAuth } from "../../../hooks/useAuth";
import { useQuotes } from "../../../context/QuoteContext";
import { Pagination } from "../Pagination/Pagination";
import "./Dashboard.css";
import { BookmarkButton } from "../BookmarkButton/BookmarkButton";
import { DeleteQuotePrompt } from "./DeleteQuotePrompt";

export function Dashboard() {
    const [tab, setTab] = useState<"stats" | "quotes" | "history">("stats");
    const [quizData, setQuizData] = useState<any[]>([]);
    const [expandedQuizId, setExpandedQuizId] = useState<string | null>(null);

    const { user, loading: authLoading } = useAuth();
    const { savedQuotes, loading: quotesLoading, removeSavedQuote } = useQuotes();
    const [localQuotes, setLocalQuotes] = useState<any[]>([]);
    const isFetched = useRef(false);
    const [modal, setModal] = useState<{ open: boolean; id: string; text: string; author: string }>({
        open: false,
        id: "",
        text: "",
        author: ""
    });
    const handleQuoteRemovalFromUI = (idToRemove: string) => {
        setLocalQuotes((prevQuotes) => prevQuotes.filter(q => (q.date || q.id) !== idToRemove));
    };

    // Search and filter states
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [timeFilter, setTimeFilter] = useState<"all" | "week" | "month">("all");
    const [quizSearchQuery, setQuizSearchQuery] = useState("");

    // Pagination states
    const [currentQuizPage, setCurrentQuizPage] = useState(1);
    const [currentQuotePage, setCurrentQuotePage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        setCurrentQuizPage(1);
        setCurrentQuotePage(1);
    }, [tab]);

    const filteredQuotes = localQuotes.filter((q) => {
        const query = searchQuery.toLowerCase();
        return q.text?.toLowerCase().includes(query) || q.author?.toLowerCase().includes(query);
    });

    const filteredQuizzes = quizData.filter((q) => {
        const recommendationMatch = !quizSearchQuery || q.recommendation?.toLowerCase().includes(quizSearchQuery.toLowerCase());
        const quizDate = new Date(q.id);

        if (selectedDate) {
            return recommendationMatch && quizDate.toISOString().split("T")[0] === selectedDate;
        }

        let dateMatch = true;
        if (timeFilter === "week") {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            dateMatch = quizDate >= sevenDaysAgo;
        } else if (timeFilter === "month") {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            dateMatch = quizDate >= thirtyDaysAgo;
        }

        return recommendationMatch && dateMatch;
    });

    useEffect(() => {
        if (savedQuotes) setLocalQuotes(savedQuotes);
    }, [savedQuotes]);

    useEffect(() => {
        if (authLoading || !user || isFetched.current) return;

        const loadQuizHistory = async () => {
            try {
                const quizSnap = await getDocs(collection(db, "users", user.uid, "dailyQuizzes"));
                const quizzes: any[] = [];
                quizSnap.forEach((d) => {
                    if (d.exists()) quizzes.push({ id: d.id, ...d.data() });
                });
                setQuizData(quizzes);
                isFetched.current = true;
            } catch (err) {
                console.error("Error loading quiz data:", err);
            }
        };
        loadQuizHistory();
    }, [user, authLoading]);

    const calculateStreaks = () => {
        if (quizData.length === 0) return { current: 0, max: 0 };
        const sortedDates = quizData
            .map(q => q.id)
            .filter(id => /^\d{4}-\d{2}-\d{2}$/.test(id))
            .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

        if (sortedDates.length === 0) return { current: 0, max: 0 };
        const uniqueDates = Array.from(new Set(sortedDates));

        let currentStreak = 0;
        let maxStreak = 0;
        let tempStreak = 0;

        const todayStr = new Date().toISOString().split("T")[0];
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        if (uniqueDates[0] === todayStr || uniqueDates[0] === yesterdayStr) {
            let expectedDate = new Date(uniqueDates[0]);
            for (let i = 0; i < uniqueDates.length; i++) {
                const currentDate = new Date(uniqueDates[i]);
                if (Math.ceil(Math.abs(expectedDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)) <= 1) {
                    currentStreak++;
                    expectedDate = currentDate;
                } else {
                    break;
                }
            }
        }

        let trackDate = new Date(uniqueDates[uniqueDates.length - 1]);
        for (let i = uniqueDates.length - 1; i >= 0; i--) {
            const curr = new Date(uniqueDates[i]);
            if (Math.ceil(Math.abs(curr.getTime() - trackDate.getTime()) / (1000 * 60 * 60 * 24)) <= 1) {
                tempStreak++;
                maxStreak = Math.max(maxStreak, tempStreak);
            } else {
                tempStreak = 1;
            }
            trackDate = curr;
        }
        return { current: currentStreak, max: maxStreak };
    };

    const streak = calculateStreaks();

    const scores = quizData.map((q) => q.avgScore).filter((v): v is number => typeof v === "number");
    const hasScores = scores.length > 0;
    const avg = hasScores ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const lowest = hasScores ? Math.min(...scores) : 0;
    const highest = hasScores ? Math.max(...scores) : 0;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const weeklyScores = quizData.filter((q) => new Date(q.id) >= sevenDaysAgo && typeof q.avgScore === "number").map((q) => q.avgScore);
    const weeklyAvg = weeklyScores.length > 0 ? weeklyScores.reduce((a, b) => a + b, 0) / weeklyScores.length : null;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const monthlyScores = quizData.filter((q) => new Date(q.id) >= thirtyDaysAgo && typeof q.avgScore === "number").map((q) => q.avgScore);
    const monthlyAvg = monthlyScores.length > 0 ? monthlyScores.reduce((a, b) => a + b, 0) / monthlyScores.length : null;

    const sad = scores.filter(s => s <= 2.5).length;
    const neutral = scores.filter(s => s > 2.5 && s < 4.5).length;
    const happy = scores.filter(s => s >= 4.5).length;

    const pieData = [
        { name: "Sad days", value: sad, fill: "#ff4d4f" },
        { name: "Neutral days", value: neutral, fill: "#ffa940" },
        { name: "Happy days", value: happy, fill: "#52c41a" }
    ].filter(item => item.value > 0);

    const totalQuizPages = Math.ceil(filteredQuizzes.length / itemsPerPage);
    const currentQuizzes = filteredQuizzes.slice((currentQuizPage - 1) * itemsPerPage, currentQuizPage * itemsPerPage);

    const totalQuotePages = Math.ceil(filteredQuotes.length / itemsPerPage);
    const currentQuotes = filteredQuotes.slice((currentQuotePage - 1) * itemsPerPage, currentQuotePage * itemsPerPage);

    const getAvgColor = (val: number | null) => {
        if (!val) return "#fa8c16";
        if (val >= 4.5) return "#52c41a";
        if (val <= 2.5) return "#ff4d4f";
        return "#fa8c16";
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-card">
                <h1 className="dashboard-header">
                    {user?.displayName || "User"}{" "}
                    <span className="dashboard-email">({user?.email})</span>
                </h1>

                <hr className="dashboard-divider" />

                <div className="tab-group">
                    <button onClick={() => setTab("stats")} className={`tab-button ${tab === "stats" ? "active" : ""}`}>
                        Mood Statistics
                    </button>
                    <button onClick={() => setTab("quotes")} className={`tab-button ${tab === "quotes" ? "active" : ""}`}>
                        Saved Quotes
                    </button>
                    <button onClick={() => setTab("history")} className={`tab-button ${tab === "history" ? "active" : ""}`}>
                        Quiz History
                    </button>
                </div>

                <div className="tab-content">
                    {tab === "stats" && (
                        <div>
                            <h2 className="stats-title">Mood quiz statistics:</h2>
                            {quizData.length > 0 ? (
                                <div className="stats-grid">
                                    <div className="chart-wrapper">
                                        <div className="chart-container">
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
                                        <div className="chart-legend">
                                            <span className="legend-happy">● Happy Days: {happy}</span>
                                            <span className="legend-neutral">● Neutral Days: {neutral}</span>
                                            <span className="legend-sad">● Sad Days: {sad}</span>
                                        </div>
                                    </div>

                                    <div className="metrics-sidebar">
                                        <div className="streak-grid-row">
                                            <div className="streak-mini-card">
                                                <span className="streak-card-label">Your Streak</span>
                                                <span className="streak-card-value">🔥 {streak.current} days</span>
                                            </div>
                                            <div className="streak-mini-card">
                                                <span className="streak-card-label">Longest Streak</span>
                                                <span className="streak-card-value">🏆 {streak.max} days</span>
                                            </div>
                                            <div className="streak-mini-card">
                                                <span className="streak-card-label">Total quizzes</span>
                                                <span className="streak-card-value">📊 {quizData.length}</span>
                                            </div>
                                        </div>

                                        <div className="stats-card">
                                            <p>
                                                Weekly average (last 7 days):{" "}
                                                <b style={{ color: getAvgColor(weeklyAvg) }}>
                                                    {weeklyAvg ? `${weeklyAvg.toFixed(2)} / 6` : "No logs this week"}
                                                </b>
                                            </p>
                                            <p>
                                                Monthly average (30 days):{" "}
                                                <b style={{ color: getAvgColor(monthlyAvg) }}>
                                                    {monthlyAvg ? `${monthlyAvg.toFixed(2)} / 6` : "No logs"}
                                                </b>
                                            </p>
                                            <p>All time average: <b style={{ color: "#007bff" }}>{avg.toFixed(2)} / 6</b></p>
                                            <p>Highest quiz score: <b>{highest.toFixed(1)} / 6</b></p>
                                            <p>Lowest quiz score: <b>{lowest.toFixed(1)} / 6</b></p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="no-data-text">No mood data yet. Take the daily quiz to start tracking your mood charts!</p>
                            )}
                        </div>
                    )}

                    {tab === "quotes" && (
                        <div>
                            <div className="tab-header-row">
                                <h2 className="tab-header-title">
                                    Your Saved Quotes
                                    <span className="tab-header-count">({filteredQuotes.length} found)</span>
                                </h2>
                                {localQuotes.length > 0 && (
                                    <input
                                        type="text"
                                        placeholder="Search quotes or authors..."
                                        value={searchQuery}
                                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentQuotePage(1); }}
                                        className="search-input"
                                    />
                                )}
                            </div>

                            {quotesLoading && localQuotes.length === 0 ? (
                                <p className="no-data-text">Loading saved dashboard entries...</p>
                            ) : localQuotes.length > 0 ? (
                                filteredQuotes.length > 0 ? (
                                    <>
                                        <div className="quotes-list">
                                            {currentQuotes.map((q, idx) => {
                                                const uniqueId = q.date || q.id || idx.toString();

                                                return (
                                                    <div key={uniqueId} className="quote-item" style={{ position: "relative" }}>
                                                        <div className="quote-text-block">
                                                            <p className="quote-text">"{q.text}"</p>
                                                            <small className="quote-author">— {q.author || "Anonymous"}</small>
                                                        </div>

                                                        <div style={{ transform: "translateY(-4px)", display: "inline-flex" }}>
                                                            <BookmarkButton
                                                                quoteId={uniqueId}
                                                                isSavedByDefault={true}
                                                                onClick={() => setModal({
                                                                    open: true,
                                                                    id: uniqueId,
                                                                    text: q.text,
                                                                    author: q.author || "Anonymous"
                                                                })}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <Pagination currentPage={currentQuotePage} totalPages={totalQuotePages} onPageChange={setCurrentQuotePage} />
                                    </>
                                ) : (
                                    <p className="no-data-text">No quotes match your search term.</p>
                                )
                            ) : (
                                <p className="no-data-text">You haven't saved any quotes to your dashboard yet.</p>
                            )}
                        </div>
                    )}

                    {tab === "history" && (
                        <div>
                            <div className="tab-header-row">
                                <h2 className="tab-header-title">
                                    Check-up History
                                    <span className="tab-header-count">({filteredQuizzes.length} found)</span>
                                </h2>

                                {quizData.length > 0 && (
                                    <div className="history-controls">
                                        <select
                                            value={timeFilter}
                                            onChange={(e) => { setTimeFilter(e.target.value as any); setCurrentQuizPage(1); }}
                                            className="history-select"
                                        >
                                            <option value="all">All Time</option>
                                            <option value="week">Last Week</option>
                                            <option value="month">Last Month</option>
                                        </select>

                                        <input
                                            type="text"
                                            placeholder="Search recommendation..."
                                            value={quizSearchQuery}
                                            onChange={(e) => { setQuizSearchQuery(e.target.value); setCurrentQuizPage(1); }}
                                            className="history-search"
                                        />
                                        At date:
                                        <input
                                            type="date"
                                            value={selectedDate}
                                            onChange={(e) => { setSelectedDate(e.target.value); setTimeFilter("all"); setCurrentQuizPage(1); }}
                                            className="history-date"
                                        />
                                    </div>
                                )}
                            </div>

                            {quizData.length > 0 ? (
                                filteredQuizzes.length > 0 ? (
                                    <>
                                        <div className="quiz-list">
                                            {currentQuizzes.map((q) => {
                                                const isExpanded = expandedQuizId === q.id;
                                                const isHappy = q.avgScore >= 4.5;
                                                const isSad = q.avgScore <= 2.5;
                                                const themeColor = isHappy ? "#52c41a" : isSad ? "#ff4d4f" : "#ffa940";
                                                const themeBg = isHappy ? "#f6ffed" : isSad ? "#fff1f0" : "#fff7e6";

                                                return (
                                                    <div
                                                        key={q.id}
                                                        className="quiz-card"
                                                        style={{ borderLeft: `5px solid ${themeColor}` }}
                                                        onClick={() => setExpandedQuizId(isExpanded ? null : q.id)}
                                                    >
                                                        <div className="quiz-card-main">
                                                            <div className="quiz-card-info">
                                                                <div className="quiz-card-title-row">
                                                                    <span className="quiz-card-id">{q.id}</span>
                                                                    <span className="quiz-card-arrow" style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
                                                                </div>
                                                                <p className="quiz-card-rec">
                                                                    <span className="quiz-card-rec-label">Recommendation:</span> {q.recommendation}
                                                                </p>
                                                            </div>
                                                            <div className="quiz-card-score" style={{ background: themeBg, color: themeColor, border: `1px solid ${themeColor}22` }}>
                                                                Mood: {typeof q.avgScore === "number" ? q.avgScore.toFixed(1) : q.avgScore} / 6
                                                            </div>
                                                        </div>

                                                        {isExpanded && (
                                                            <div className="quiz-details-dropdown" onClick={(e) => e.stopPropagation()}>
                                                                <h4 className="quiz-details-title">Question Log Details</h4>

                                                                <div className="quiz-details-content" style={{ textAlign: "left", fontSize: "14px", display: "grid", gap: "12px", marginTop: "12px" }}>
                                                                    {q.answers && Array.isArray(q.answers) && q.answers.length > 0 ? (
                                                                        q.answers.map((item: any, i: number) => {
                                                                            const currentScore = item.value !== undefined ? item.value : item.score;

                                                                            let itemColor = "#ffa940";
                                                                            if (typeof currentScore === "number") {
                                                                                if (currentScore >= 5) itemColor = "#52c41a";
                                                                                if (currentScore <= 2) itemColor = "#ff4d4f";
                                                                            }

                                                                            return (
                                                                                <div key={i} style={{ borderBottom: "1px dashed #e2e8f0", paddingBottom: "10px" }}>
                                                                                    <p style={{ margin: "0 0 4px 0", fontWeight: 600, color: "#2d3748", lineHeight: "1.4" }}>
                                                                                        {i + 1}. {item.question || item.text || `Question ${i + 1}`}
                                                                                    </p>
                                                                                    <p style={{ margin: "0", color: "#4a5568", fontSize: "13px" }}>
                                                                                        Selected Score: <span style={{ fontWeight: 700, color: itemColor }}>{currentScore}</span> / 6
                                                                                    </p>
                                                                                </div>
                                                                            );
                                                                        })
                                                                    ) : (
                                                                        <p style={{ color: "#718096", fontStyle: "italic" }}>No diagnostic answers found for this log template.</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </>
                                ) : (
                                    <p className="no-data-text">No items match your search details.</p>
                                )
                            ) : (
                                <p className="no-data-text"><>No historical data logged yet</>.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <DeleteQuotePrompt
                isOpen={modal.open}
                quoteData={modal.open ? { id: modal.id, text: modal.text, author: modal.author } : null}
                onClose={() => setModal({ open: false, id: "", text: "", author: "" })}
                onDeleteSuccess={(idToRemove) => {
                    handleQuoteRemovalFromUI(idToRemove);
                    removeSavedQuote(idToRemove);
                }}
            />
        </div>
    );
}