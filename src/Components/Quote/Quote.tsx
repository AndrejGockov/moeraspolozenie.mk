import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuotes } from "../../Context/QuoteContext";
import { useAuth } from "../../hooks/useAuth";
import "./Quote.css";

import { db } from "../../firebase";
import {
    doc,
    setDoc,
    getDoc,
    serverTimestamp
} from "firebase/firestore";

export function Quote() {
    const navigate = useNavigate();
    const { dailyQuote, loading: quoteLoading, addSavedQuote } = useQuotes();
    const { user, loading: authLoading } = useAuth();

    const today = new Date().toISOString().split("T")[0];
    const cacheKey = user ? `savedQuote_${user.uid}_${today}` : null;

    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);
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

    const saveQuote = async () => {
        if (!user) {
            navigate("/login");
            return;
        }

        if (!hasQuote) return;

        setSaved(true);
        setSaving(true);

        if (cacheKey) {
            localStorage.setItem(cacheKey, "true");
        }

        try {
            await setDoc(
                doc(db, "users", user.uid, "savedQuotes", today),
                {
                    text: dailyQuote.text,
                    author: dailyQuote.author,
                    createdAt: serverTimestamp()
                }
            );

            addSavedQuote({
                text: dailyQuote.text,
                author: dailyQuote.author,
                date: today
            });
        } catch (err) {
            console.error(err);
            setSaved(false);
            if (cacheKey) {
                localStorage.setItem(cacheKey, "false");
            }
        } finally {
            setSaving(false);
        }
    };

    const getButtonText = () => {
        if (saving) return "Saving...";
        if (saved) return "Saved to dashboard";
        if (authLoading) return "Loading...";
        if (!user) return "Login to save today's quote!";
        return "Save today's quote!";
    };

    const isGlobalLoading = quoteLoading;

    return (
        <div className="quote-container">
            <div className="quote-glass-card">
                <div className="quote-badge">Daily Quote</div>

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

                        <button
                            onClick={saveQuote}
                            disabled={saving || saved}
                            className="save-quote-btn"
                        >
                            {getButtonText()}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
