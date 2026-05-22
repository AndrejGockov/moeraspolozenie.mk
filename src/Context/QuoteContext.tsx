import React, { createContext, useState, useEffect, useContext } from "react";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "../firebase";

const db = getFirestore(app);

type Quote = {
    text: string;
    author: string;
};

type QuoteContextType = {
    dailyQuote: Quote;
    loading: boolean;
};

const QuoteContext = createContext<QuoteContextType | null>(null);

export function QuoteProvider({ children }: { children: React.ReactNode }) {
    const [dailyQuote, setDailyQuote] = useState<Quote>({
        text: "",
        author: ""
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuote = async () => {
            try {
                const snap = await getDoc(doc(db, "quotes", "daily"));

                if (snap.exists()) {
                    const data = snap.data();

                    setDailyQuote({
                        text: data.text,
                        author: data.author
                    });
                }
            } catch (err) {
                console.error("Failed to load quote:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchQuote();
    }, []);

    return (
        <QuoteContext.Provider value={{ dailyQuote, loading }}>
            {children}
        </QuoteContext.Provider>
    );
}

export function useQuotes() {
    const ctx = useContext(QuoteContext);
    if (!ctx) throw new Error("useQuotes must be used inside QuoteProvider");
    return ctx;
}