import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "./useAuth";

export function useQuizVerification() {
    const { user, loading: authLoading } = useAuth();
    const [checking, setChecking] = useState(true);
    const navigate = useNavigate();
    const today = new Date().toISOString().split("T")[0];

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            navigate("/login");
            return;
        }

        const verifyQuizStatus = async () => {
            const cachedQuiz = localStorage.getItem(`quiz_${today}`);
            if (cachedQuiz) {
                navigate("/quiz/completed");
                return;
            }

            const ref = doc(db, "users", user.uid, "dailyQuizzes", today);
            const snap = await getDoc(ref);

            if (snap.exists()) {
                localStorage.setItem(`quiz_${today}`, JSON.stringify(snap.data()));
                navigate("/quiz/completed");
                return;
            }

            setChecking(false);
        };

        verifyQuizStatus();
    }, [user, authLoading, navigate, today]);

    return {
        isVerifying: authLoading || checking
    };
}