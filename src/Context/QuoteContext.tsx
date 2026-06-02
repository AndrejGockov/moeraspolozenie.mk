import React, {
    createContext,
    useState,
    useEffect,
    useContext
} from "react";

import {
    getFirestore,
    doc,
    getDoc,
    collection,
    getDocs
} from "firebase/firestore";

import {
    onAuthStateChanged,
    type User
} from "firebase/auth";

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
    user: User | null;
};

const QuoteContext = createContext<QuoteContextType | null>(null);

export function QuoteProvider({ children }: { children: React.ReactNode }) {
    const [dailyQuote, setDailyQuote] = useState<Quote>({
        text: "",
        author: ""
    });

    const [savedQuotes, setSavedQuotes] = useState<SavedQuote[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u);
        });

        return () => unsub();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const snap = await getDoc(doc(db, "quotes", "daily"));

                if (snap.exists()) {
                    const data = snap.data();
                    setDailyQuote({
                        text: data.text,
                        author: data.author
                    });
                }

                if (user) {
                    const savedSnap = await getDocs(
                        collection(db, "users", user.uid, "savedQuotes")
                    );

                    const quotes: SavedQuote[] = [];

                    savedSnap.forEach((d) => {
                        const data = d.data();
                        quotes.push({
                            text: data.text,
                            date: d.id
                        });
                    });

                    quotes.sort((a, b) => b.date.localeCompare(a.date));

                    setSavedQuotes(quotes);
                } else {
                    setSavedQuotes([]);
                }

            } catch (err) {
                console.error("Failed to load quotes:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    return (
        <QuoteContext.Provider
            value={{ dailyQuote, savedQuotes, loading, user }}
        >
            {children}
        </QuoteContext.Provider>
    );
}

export function useQuotes() {
    const ctx = useContext(QuoteContext);
    if (!ctx) throw new Error("useQuotes must be used inside QuoteProvider");
    return ctx;
}