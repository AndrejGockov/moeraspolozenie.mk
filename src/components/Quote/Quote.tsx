import React from "react";
import { useQuotes } from "../../Context/QuoteContext";
import "./Quote.css";

export function Quote() {
    const { dailyQuote, loading } = useQuotes();

    const hasQuote = dailyQuote?.text && dailyQuote?.author;

    return (
        <div className="quote-container">
            <div className="quote-glass-card">
                <div className="quote-badge">Today's Focus</div>

                {loading && (
                    <div className="quote-skeleton">
                        <div className="skeleton-line large"></div>
                        <div className="skeleton-line small"></div>
                    </div>
                )}

                {!loading && !hasQuote && (
                    <div className="quote-error-zone">
                        <p>
                            No quote available right now. Please refresh the page or check Firebase data.
                        </p>
                    </div>
                )}

                {!loading && hasQuote && (
                    <div className="quote-content-wrapper">
                        <blockquote className="quote-typography">
                            <span className="quote-mark open">“</span>

                            <p className="quote-main-text">
                                {dailyQuote.text}
                            </p>

                            <span className="quote-mark close">”</span>

                            <cite className="quote-author-name">
                                — {dailyQuote.author}
                            </cite>
                        </blockquote>
                    </div>
                )}
            </div>
        </div>
    );
}