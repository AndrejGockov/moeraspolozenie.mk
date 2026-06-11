import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "./useAuth";

function getTimeUntilMidnight() {
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setHours(24, 0, 0, 0);
    const diff = tomorrow.getTime() - now.getTime();
    return {
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    };
}

export function useCompletedQuizData() {
    const { user } = useAuth();
    const today = new Date().toISOString().split("T")[0];

    const [data, setData] = useState(() => {
        const cached = localStorage.getItem(`quiz_${today}`);
        return cached ? JSON.parse(cached) : null;
    });

    const [timeLeft, setTimeLeft] = useState(getTimeUntilMidnight());

    useEffect(() => {
        const loadQuiz = async () => {
            if (!user || data) return;

            const ref = doc(db, "users", user.uid, "dailyQuizzes", today);
            const snap = await getDoc(ref);

            if (snap.exists()) {
                const quizData = snap.data();
                setData(quizData);
                localStorage.setItem(`quiz_${today}`, JSON.stringify(quizData));
            }
        };

        loadQuiz();
    }, [user, today, data]);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(getTimeUntilMidnight());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const isLoadingData = !data;

    return {
        data,
        timeLeft,
        isLoadingData
    };
}