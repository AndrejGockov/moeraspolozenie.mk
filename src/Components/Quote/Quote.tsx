import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuotes } from "../../Context/QuoteContext";
import { useAuth } from "../../hooks/useAuth";
import "./Quote.css";
import { BookmarkIcon } from "../BookmarkButton/BookmarkIcon";

import { db } from "../../firebase";
import { doc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";

export function Quote() {
    const navigate = useNavigate();
    const { dailyQuote, savedQuotes, loading: quoteLoading, addSavedQuote, removeSavedQuote } = useQuotes();
    const { user, loading: authLoading } = useAuth();
    const [loadingAction, setLoadingAction] = useState(false);
    const today = new Date().toISOString().split("T")[0];
    const hasQuote = dailyQuote?.text && dailyQuote?.author;
    const isSaved = savedQuotes.some((q) => q.date === today);

    const handleBookmarkToggle = async () => {
        if (!user) {
            navigate("/login");
            return;
        }
        if (!hasQuote || loadingAction) return;

        const docRef = doc(db, "users", user.uid, "savedQuotes", today);
        const cacheKey = `savedQuote_${user.uid}_${today}`;
        setLoadingAction(true);

        try {
            if (!isSaved) {
                // Optimistic Local Storage update for quick feedback if needed
                localStorage.setItem(cacheKey, "true");
                await setDoc(docRef, {
                    text: dailyQuote.text,
                    author: dailyQuote.author,
                    createdAt: serverTimestamp()
                });

                addSavedQuote({
                    text: dailyQuote.text,
                    author: dailyQuote.author,
                    date: today
                });
            } else {
                localStorage.setItem(cacheKey, "false");
                await deleteDoc(docRef);
                removeSavedQuote(today);
            }
        } catch (err) {
            console.error("Error toggling bookmark:", err);
            // Revert cache on failure
            localStorage.setItem(cacheKey, String(isSaved));
        } finally {
            setLoadingAction(false);
        }
    };

    const getTooltipText = () => {
        if (loadingAction) return "Processing...";
        if (isSaved) return "Remove bookmark";
        if (authLoading) return "Loading...";
        if (!user) return "Login to save today's quote!";
        return "Save today's quote!";
    };

    return (
        <div className="quote-container">
            <div className="quote-glass-card">
                <div className="quote-badge">Daily Quote</div>

                {!quoteLoading && hasQuote && (
                    <button
                        onClick={handleBookmarkToggle}
                        disabled={loadingAction || authLoading}
                        className={`bookmark-btn ${isSaved ? "is-saved" : ""}`}
                        title={getTooltipText()}
                        aria-label={getTooltipText()}
                    >
                        <BookmarkIcon filled={isSaved} className="bookmark-icon" />
                    </button>
                )}

                {quoteLoading && (
                    <div className="quote-skeleton">
                        <div className="skeleton-line large"></div>
                        <div className="skeleton-line small"></div>
                    </div>
                )}

                {!quoteLoading && hasQuote && (
                    <div className="quote-content-wrapper">
                        <blockquote className="quote-typography">
                            <span className="quote-mark open">“</span>
                            <p style={{ margin: 0 }} className="quote-main-text">
                                {dailyQuote.text}
                            </p>
                            <span className="quote-mark close">”</span>
                            <cite className="quote-author-name">— {dailyQuote.author}</cite>
                        </blockquote>
                    </div>
                )}
            </div>
        </div>
    );
}