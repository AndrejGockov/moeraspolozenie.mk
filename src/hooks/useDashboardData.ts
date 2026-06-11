import { useState, useEffect, useRef } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { useAuth } from "./useAuth";
import { useQuotes } from "../context/QuoteContext";

export function useDashboardData() {
    const [tab, setTab] = useState<"stats" | "quotes" | "history">("stats");
    const [quizData, setQuizData] = useState<any[]>([]);
    const { user, loading: authLoading } = useAuth();
    const { savedQuotes, loading: quotesLoading, removeSavedQuote } = useQuotes();
    const [localQuotes, setLocalQuotes] = useState<any[]>([]);
    const isFetched = useRef(false);

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [timeFilter, setTimeFilter] = useState<"all" | "week" | "month">("all");
    const [quizSearchQuery, setQuizSearchQuery] = useState("");

    const [currentQuizPage, setCurrentQuizPage] = useState(1);
    const [currentQuotePage, setCurrentQuotePage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        setCurrentQuizPage(1);
        setCurrentQuotePage(1);
    }, [tab]);

    useEffect(() => {
        if (savedQuotes) setLocalQuotes(savedQuotes);
    }, [savedQuotes]);

    useEffect(() => {
        if (authLoading || !user || isFetched.current) return;

        const loadQuizHistory = async () => {
            try {
                const quizSnap = await getDocs(collection(db, "users", user.uid, "dailyQuizzes"));
                const quizzes: any[] = [];
                quizSnap.forEach((d) => {
                    if (d.exists()) quizzes.push({ id: d.id, ...d.data() });
                });
                setQuizData(quizzes);
                isFetched.current = true;
            } catch (err) {
                console.error("Error loading quiz data:", err);
            }
        };
        loadQuizHistory();
    }, [user, authLoading]);

    const handleQuoteRemovalFromUI = (idToRemove: string) => {
        setLocalQuotes((prevQuotes) => prevQuotes.filter(q => (q.date || q.id) !== idToRemove));
    };

    const filteredQuotes = localQuotes.filter((q) => {
        const query = searchQuery.toLowerCase();
        return q.text?.toLowerCase().includes(query) || q.author?.toLowerCase().includes(query);
    });

    const filteredQuizzes = quizData.filter((q) => {
        const recommendationMatch = !quizSearchQuery || q.recommendation?.toLowerCase().includes(quizSearchQuery.toLowerCase());
        const quizDate = new Date(q.id);

        if (selectedDate) {
            return recommendationMatch && quizDate.toISOString().split("T")[0] === selectedDate;
        }

        let dateMatch = true;
        if (timeFilter === "week") {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            dateMatch = quizDate >= sevenDaysAgo;
        } else if (timeFilter === "month") {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            dateMatch = quizDate >= thirtyDaysAgo;
        }
        return recommendationMatch && dateMatch;
    });

    return {
        tab, setTab,
        user,
        quizData,
        quotesLoading,
        localQuotes,
        filteredQuotes,
        filteredQuizzes,
        searchQuery, setSearchQuery,
        selectedDate, setSelectedDate,
        timeFilter, setTimeFilter,
        quizSearchQuery, setQuizSearchQuery,
        currentQuizPage, setCurrentQuizPage,
        currentQuotePage, setCurrentQuotePage,
        itemsPerPage,
        handleQuoteRemovalFromUI,
        removeSavedQuote
    };
}