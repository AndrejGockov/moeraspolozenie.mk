import React, { createContext, useState, useEffect, useContext } from "react";
import { getFirestore, doc, getDoc, collection, getDocs } from "firebase/firestore";
import { app, auth } from "../firebase";

const db = getFirestore(app);

type Quote = {
    text: string;
    author: string;
};

type SavedQuote = {
    text: string;
    date: string;
};

type QuoteContextType = {
    dailyQuote: Quote;
    savedQuotes: SavedQuote[];
    loading: boolean;
};

const QuoteContext = createContext<QuoteContextType | null>(null);

export function QuoteProvider({ children }: { children: React.ReactNode }) {
    const [dailyQuote, setDailyQuote] = useState<Quote>({
        text: "",
        author: ""
    });

    const [savedQuotes, setSavedQuotes] = useState<SavedQuote[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const user = auth.currentUser;

                // 1. GLOBAL DAILY QUOTE
                const snap = await getDoc(doc(db, "quotes", "daily"));

                if (snap.exists()) {
                    const data = snap.data();
                    setDailyQuote({
                        text: data.text,
                        author: data.author
                    });
                }

                // 2. USER SAVED QUOTES
                if (user) {
                    const savedSnap = await getDocs(
                        collection(db, "users", user.uid, "savedQuotes")
                    );

                    const quotes: SavedQuote[] = [];

                    savedSnap.forEach((doc) => {
                        const data = doc.data();
                        quotes.push({
                            text: data.text,
                            date: doc.id
                        });
                    });

                    // newest first
                    quotes.sort((a, b) => b.date.localeCompare(a.date));

                    setSavedQuotes(quotes);
                }

            } catch (err) {
                console.error("Failed to load quotes:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <QuoteContext.Provider value={{ dailyQuote, savedQuotes, loading }}>
            {children}
        </QuoteContext.Provider>
    );
}

export function useQuotes() {
    const ctx = useContext(QuoteContext);
    if (!ctx) throw new Error("useQuotes must be used inside QuoteProvider");
    return ctx;
}