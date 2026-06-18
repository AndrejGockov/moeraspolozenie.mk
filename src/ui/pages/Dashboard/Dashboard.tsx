import React, { useState } from "react";
import { useDashboardData } from "../../../hooks/useDashboardData";
import { useStreakMetrics } from "../../../hooks/useStreakMetrics";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Pagination } from "../../components/Pagination/Pagination";
import { BookmarkButton } from "../../components/Quote/BookmarkButton";
import { DeleteQuotePrompt } from "../../components/Dashboard/DeleteQuotePrompt";
import "./Dashboard.css";

export function Dashboard() {
    const data = useDashboardData();
    const metrics = useStreakMetrics(data.quizData);

    const [expandedQuizId, setExpandedQuizId] = useState<string | null>(null);
    const [modal, setModal] = useState<{ open: boolean; id: string; text: string; author: string }>({
        open: false, id: "", text: "", author: ""
    });

    // const totalQuizPages = Math.ceil(data.filteredQuizzes.length / data.itemsPerPage);
    const currentQuizzes = data.filteredQuizzes.slice((data.currentQuizPage - 1) * data.itemsPerPage, data.currentQuizPage * data.itemsPerPage);

    const totalQuotePages = Math.ceil(data.filteredQuotes.length / data.itemsPerPage);
    const currentQuotes = data.filteredQuotes.slice((data.currentQuotePage - 1) * data.itemsPerPage, data.currentQuotePage * data.itemsPerPage);

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
                    {data.user?.displayName || "User"}{" "}
                    <span className="dashboard-email">({data.user?.email})</span>
                </h1>

                <hr className="dashboard-divider" />

                <div className="tab-group">
                    <button onClick={() => data.setTab("stats")} className={`tab-button ${data.tab === "stats" ? "active" : ""}`}>
                        Overview
                    </button>
                    <button onClick={() => data.setTab("quotes")} className={`tab-button ${data.tab === "quotes" ? "active" : ""}`}>
                        Saved Quotes
                    </button>
                    <button onClick={() => data.setTab("history")} className={`tab-button ${data.tab === "history" ? "active" : ""}`}>
                        History
                    </button>
                </div>

                <div className="tab-content">
                    {data.tab === "stats" && (
                        <div>
                            <h2 className="stats-title">Past Quizzes:</h2>
                            {data.quizData.length > 0 ? (
                                <div className="stats-grid">
                                    <div className="chart-wrapper">
                                        <div className="chart-container">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie data={metrics.pieData} dataKey="value" nameKey="name" outerRadius={90} stroke="none">
                                                        {metrics.pieData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="chart-legend">
                                            <span className="legend-happy">● Happy Days: {metrics.happy}</span>
                                            <span className="legend-neutral">● Neutral Days: {metrics.neutral}</span>
                                            <span className="legend-sad">● Sad Days: {metrics.sad}</span>
                                        </div>
                                    </div>

                                    <div className="metrics-sidebar">
                                        <div className="streak-grid-row">
                                            <div className="streak-mini-card">
                                                <span className="streak-card-label">Your Streak</span>
                                                <span className="streak-card-value">🔥 {metrics.streak.current} days</span>
                                            </div>
                                            <div className="streak-mini-card">
                                                <span className="streak-card-label">Longest Streak</span>
                                                <span className="streak-card-value">🏆 {metrics.streak.max} days</span>
                                            </div>
                                            <div className="streak-mini-card">
                                                <span className="streak-card-label">Total quizzes</span>
                                                <span className="streak-card-value">📊 {data.quizData.length}</span>
                                            </div>
                                        </div>

                                        <div className="stats-card">
                                            <p>
                                                Weekly average (last 7 days):{" "}
                                                <b style={{ color: getAvgColor(metrics.weeklyAvg) }}>
                                                    {metrics.weeklyAvg ? `${metrics.weeklyAvg.toFixed(2)} / 6` : "No logs this week"}
                                                </b>
                                            </p>
                                            <p>
                                                Monthly average (30 days):{" "}
                                                <b style={{ color: getAvgColor(metrics.monthlyAvg) }}>
                                                    {metrics.monthlyAvg ? `${metrics.monthlyAvg.toFixed(2)} / 6` : "No logs"}
                                                </b>
                                            </p>
                                            <p>All time average: <b style={{ color: "#007bff" }}>{metrics.avg.toFixed(2)} / 6</b></p>
                                            <p>Highest quiz score: <b>{metrics.highest.toFixed(1)} / 6</b></p>
                                            <p>Lowest quiz score: <b>{metrics.lowest.toFixed(1)} / 6</b></p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="no-data-text">No mood data yet. Take the daily quiz to start tracking your mood charts!</p>
                            )}
                        </div>
                    )}

                    {data.tab === "quotes" && (
                        <div>
                            <div className="tab-header-row">
                                <h2 className="tab-header-title">
                                    Your Saved Quotes
                                    <span className="tab-header-count">({data.filteredQuotes.length} found)</span>
                                </h2>
                                {data.localQuotes.length > 0 && (
                                    <input
                                        type="text"
                                        placeholder="Search quotes or authors..."
                                        value={data.searchQuery}
                                        onChange={(e) => { data.setSearchQuery(e.target.value); data.setCurrentQuotePage(1); }}
                                        className="search-input"
                                    />
                                )}
                            </div>

                            {data.quotesLoading && data.localQuotes.length === 0 ? (
                                <p className="no-data-text">Loading saved dashboard entries...</p>
                            ) : data.localQuotes.length > 0 ? (
                                data.filteredQuotes.length > 0 ? (
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
                                        <Pagination currentPage={data.currentQuotePage} totalPages={totalQuotePages} onPageChange={data.setCurrentQuotePage} />
                                    </>
                                ) : (
                                    <p className="no-data-text">No quotes match your search term.</p>
                                )
                            ) : (
                                <p className="no-data-text">You haven't saved any quotes to your dashboard yet.</p>
                            )}
                        </div>
                    )}

                    {data.tab === "history" && (
                        <div>
                            <div className="tab-header-row">
                                <h2 className="tab-header-title">
                                    Check-up History
                                    <span className="tab-header-count">({data.filteredQuizzes.length} found)</span>
                                </h2>

                                {data.quizData.length > 0 && (
                                    <div className="history-controls">
                                        <select
                                            value={data.timeFilter}
                                            onChange={(e) => { data.setTimeFilter(e.target.value as any); data.setCurrentQuizPage(1); }}
                                            className="history-select"
                                        >
                                            <option value="all">All Time</option>
                                            <option value="week">Last Week</option>
                                            <option value="month">Last Month</option>
                                        </select>

                                        <input
                                            type="text"
                                            placeholder="Search recommendation..."
                                            value={data.quizSearchQuery}
                                            onChange={(e) => { data.setQuizSearchQuery(e.target.value); data.setCurrentQuizPage(1); }}
                                            className="history-search"
                                        />
                                        At date:
                                        <input
                                            type="date"
                                            value={data.selectedDate}
                                            onChange={(e) => { data.setSelectedDate(e.target.value); data.setTimeFilter("all"); data.setCurrentQuizPage(1); }}
                                            className="history-date"
                                        />
                                    </div>
                                )}
                            </div>

                            {data.quizData.length > 0 ? (
                                data.filteredQuizzes.length > 0 ? (
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
                                <p className="no-data-text">No historical data logged yet.</p>
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
                    data.handleQuoteRemovalFromUI(idToRemove);
                    data.removeSavedQuote(idToRemove);
                }}
            />
        </div>
    );
}