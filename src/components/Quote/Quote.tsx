import React, { useEffect, useState } from "react";
import { useQuotes } from "../../Context/QuoteContext";
import "./Quote.css";

import { auth, db } from "../../firebase";
import {
    doc,
    setDoc,
    getDoc,
    serverTimestamp
} from "firebase/firestore";

export function Quote() {
    const { dailyQuote, loading } = useQuotes();

    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const hasQuote = dailyQuote?.text && dailyQuote?.author;

    const today = new Date().toISOString().split("T")[0];

    // 🔥 CHECK IF QUOTE ALREADY SAVED (persist after refresh)
    useEffect(() => {
        const checkSaved = async () => {
            const user = auth.currentUser;
            if (!user) return;

            const ref = doc(db, "users", user.uid, "savedQuotes", today);
            const snap = await getDoc(ref);

            if (snap.exists()) {
                setSaved(true);
            } else {
                setSaved(false);
            }
        };

        checkSaved();
    }, [today]);

    const saveQuote = async () => {
        const user = auth.currentUser;
        if (!user || !hasQuote) return;

        setSaving(true);

        try {
            await setDoc(
                doc(db, "users", user.uid, "savedQuotes", today),
                {
                    text: dailyQuote.text,
                    author: dailyQuote.author,
                    createdAt: serverTimestamp()
                }
            );

            setSaved(true);
        } catch (err) {
            console.error("Failed to save quote:", err);
        } finally {
            setSaving(false);
        }
    };

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
                        <p>No quote available right now.</p>
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

                        {/* SAVE BUTTON */}
                        <button
                            onClick={saveQuote}
                            disabled={saving || saved}
                            className="save-quote-btn"
                        >
                            {saved
                                ? "Already saved"
                                : saving
                                    ? "Saving..."
                                    : "Save Quote"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}