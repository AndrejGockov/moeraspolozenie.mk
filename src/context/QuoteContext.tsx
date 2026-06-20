import React, { createContext, useContext, useEffect, useState } from "react";
import { getFirestore, doc, getDoc, collection, getDocs } from "firebase/firestore";
import { app } from "../firebase";
import { useAuth } from "../hooks/useAuth";

const db = getFirestore(app);

type Quote = {
    text: string;
    author: string;
};

type SavedQuote = {
    text: string;
    author: string;
    date: string;
};

type QuoteContextType = {
    dailyQuote: Quote;
    savedQuotes: SavedQuote[];
    loading: boolean;
    addSavedQuote: (newQuote: SavedQuote) => void;
    removeSavedQuote: (dateId: string) => void;
};

const QuoteContext = createContext<QuoteContextType | null>(null);

function getNextExpiry(): number {
    const now = new Date();
    const next = new Date();
    next.setUTCHours(2, 5, 0, 0); // updates at UTC 01:05 with firestore buffer
    if (next <= now) next.setUTCDate(next.getUTCDate() + 1);
    return next.getTime();
}

export function QuoteProvider({ children }: { children: React.ReactNode }) {
    const { user, loading: authLoading } = useAuth();

    const [dailyQuote, setDailyQuote] = useState<Quote>(() => {
        const cached = localStorage.getItem("dailyQuote");
        return cached ? JSON.parse(cached) : { text: "", author: "" };
    });

    const [savedQuotes, setSavedQuotes] = useState<SavedQuote[]>([]);
    const [quoteLoading, setQuoteLoading] = useState(true);
    const [savedQuotesLoading, setSavedQuotesLoading] = useState(false);

    useEffect(() => {
        const fetchDailyQuote = async () => {
            const expiry = localStorage.getItem("quote_expiry");
            if (expiry && Date.now() < parseInt(expiry)) {
                setQuoteLoading(false);
                return;
            }

            try {
                setQuoteLoading(true);
                const snap = await getDoc(doc(db, "quotes", "daily"));

                if (snap.exists()) {
                    const data = snap.data();
                    const quote = { text: data.text || "", author: data.author || "" };
                    setDailyQuote(quote);
                    localStorage.setItem("dailyQuote", JSON.stringify(quote));
                    localStorage.setItem("quote_expiry", getNextExpiry().toString());
                }
            } catch (err) {
                console.error("Error fetching daily quote:", err);
            } finally {
                setQuoteLoading(false);
            }
        };

        fetchDailyQuote();
    }, []);

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            setSavedQuotes([]);
            setSavedQuotesLoading(false);
            return;
        }

        const fetchSavedQuotes = async () => {
            try {
                setSavedQuotesLoading(true);
                const savedSnap = await getDocs(
                    collection(db, "users", user.uid, "savedQuotes")
                );

                const quotes: SavedQuote[] = [];
                savedSnap.forEach((d) => {
                    const data = d.data();
                    quotes.push({
                        text: data.text || "",
                        author: data.author || "Anonymous",
                        date: d.id
                    });
                });

                quotes.sort((a, b) => b.date.localeCompare(a.date));
                setSavedQuotes(quotes);
            } catch (err) {
                console.error("Error fetching saved quotes:", err);
            } finally {
                setSavedQuotesLoading(false);
            }
        };

        fetchSavedQuotes();
    }, [user, authLoading]);

    const addSavedQuote = (newQuote: SavedQuote) => {
        setSavedQuotes((prev) => {
            if (prev.some((q) => q.date === newQuote.date)) return prev;
            const updated = [newQuote, ...prev];
            return updated.sort((a, b) => b.date.localeCompare(a.date));
        });
    };

    const removeSavedQuote = (dateId: string) => {
        setSavedQuotes((prev) => prev.filter((q) => q.date !== dateId));
        if (user?.uid) {
            const cacheKey = `savedQuote_${user.uid}_${dateId}`;
            localStorage.removeItem(cacheKey);
        }
    };

    const globalLoading = quoteLoading || authLoading || savedQuotesLoading;

    return (
        <QuoteContext.Provider value={{ dailyQuote, savedQuotes, loading: globalLoading, addSavedQuote, removeSavedQuote }}>
            {children}
        </QuoteContext.Provider>
    );
}

export function useQuotes() {
    const ctx = useContext(QuoteContext);
    if (!ctx) throw new Error("useQuotes must be used inside QuoteProvider");
    return ctx;
}