import React, { ReactNode } from "react";
import { useQuizVerification } from "../../../hooks/useQuizVerification";

export function QuizGuard({ children }: { children: ReactNode }) {
    const { isVerifying } = useQuizVerification();

    if (isVerifying) return null;

    return <>{children}</>;
}