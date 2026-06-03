import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuotes } from "../../Context/QuoteContext";
import { useAuth } from "../../hooks/useAuth";
import "./Quote.css";
import { BookmarkIcon } from "../BookmarkIcon/BookmarkIcon";

import { db } from "../../firebase";
import {
    doc,
    setDoc,
    deleteDoc, // Added deleteDoc
    getDoc,
    serverTimestamp
} from "firebase/firestore";

export function Quote() {
    const navigate = useNavigate();
    // Assuming useQuotes context might have a removeSavedQuote,
    // but we can handle local state even if it doesn't.
    const { dailyQuote, loading: quoteLoading, addSavedQuote, removeSavedQuote } = useQuotes();
    const { user, loading: authLoading } = useAuth();

    const today = new Date().toISOString().split("T")[0];
    const cacheKey = user ? `savedQuote_${user.uid}_${today}` : null;

    const [saved, setSaved] = useState(false);
    const [loadingAction, setLoadingAction] = useState(false); // Combined saving/deleting state
    const [syncing, setSyncing] = useState(false);

    const hasQuote = dailyQuote?.text && dailyQuote?.author;

    useEffect(() => {
        if (cacheKey) {
            const cachedValue = localStorage.getItem(cacheKey) === "true";
            setSaved(cachedValue);
            if (!cachedValue) {
                setSyncing(true);
            }
        }
    }, [cacheKey]);

    useEffect(() => {
        if (!user?.uid || !cacheKey || !syncing) {
            return;
        }

        const sync = async () => {
            try {
                const ref = doc(db, "users", user.uid, "savedQuotes", today);
                const snap = await getDoc(ref);
                const exists = snap.exists();

                setSaved(exists);
                localStorage.setItem(cacheKey, String(exists));
            } catch (err) {
                console.error("Sync error:", err);
            } finally {
                setSyncing(false);
            }
        };

        sync();
    }, [user?.uid, today, cacheKey, syncing]);

    const handleBookmarkToggle = async () => {
        if (!user) {
            navigate("/login");
            return;
        }

        if (!hasQuote || loadingAction) return;

        const docRef = doc(db, "users", user.uid, "savedQuotes", today);
        const previousSavedState = saved;

        // Optimistic UI updates
        setSaved(!previousSavedState);
        setLoadingAction(true);
        if (cacheKey) {
            localStorage.setItem(cacheKey, String(!previousSavedState));
        }

        try {
            if (!previousSavedState) {
                await setDoc(docRef, {
                    text: dailyQuote.text,
                    author: dailyQuote.author,
                    createdAt: serverTimestamp()
                });

                if (typeof addSavedQuote === "function") {
                    addSavedQuote({
                        text: dailyQuote.text,
                        author: dailyQuote.author,
                        date: today
                    });
                }
            } else {
                await deleteDoc(docRef);

                if (typeof removeSavedQuote === "function") {
                    removeSavedQuote(today);
                }
            }
        } catch (err) {
            console.error("Error toggling bookmark:", err);
            setSaved(previousSavedState);
            if (cacheKey) {
                localStorage.setItem(cacheKey, String(previousSavedState));
            }
        } finally {
            setLoadingAction(false);
        }
    };

    const isGlobalLoading = quoteLoading;

    const getTooltipText = () => {
        if (loadingAction) return "Processing...";
        if (saved) return "Remove bookmark";
        if (authLoading) return "Loading...";
        if (!user) return "Login to save today's quote!";
        return "Save today's quote!";
    };

    return (
        <div className="quote-container">
            <div className="quote-glass-card">
                <div className="quote-badge">Daily Quote</div>

                {!isGlobalLoading && hasQuote && (
                    <button
                        onClick={handleBookmarkToggle}
                        disabled={loadingAction || authLoading}
                        className={`bookmark-btn ${saved ? "is-saved" : ""}`}
                        title={getTooltipText()}
                        aria-label={getTooltipText()}
                    >
                        <BookmarkIcon
                            filled={saved}
                            className="bookmark-icon"
                        />
                    </button>
                )}

                {isGlobalLoading && (
                    <div className="quote-skeleton">
                        <div className="skeleton-line large"></div>
                        <div className="skeleton-line small"></div>
                    </div>
                )}

                {!isGlobalLoading && hasQuote && (
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