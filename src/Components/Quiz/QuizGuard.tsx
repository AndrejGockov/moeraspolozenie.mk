import React, { ReactNode, useEffect, useState } from "react";
import { db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export function QuizGuard({ children }: { children: ReactNode }) {
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
            // Check local cache first before burning a Firestore document read
            const cachedQuiz = localStorage.getItem(`quiz_${today}`);
            if (cachedQuiz) {
                navigate("/quiz/completed");
                return;
            }

            const ref = doc(db, "users", user.uid, "dailyQuizzes", today);
            const snap = await getDoc(ref);

            if (snap.exists()) {
                // Seed cache instantly so future router transitions don't hit the network
                localStorage.setItem(`quiz_${today}`, JSON.stringify(snap.data()));
                navigate("/quiz/completed");
                return;
            }

            setChecking(false);
        };

        verifyQuizStatus();
    }, [user, authLoading, navigate, today]);

    if (authLoading || checking) return null;

    return <>{children}</>;
}
