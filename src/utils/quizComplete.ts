import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export async function hasCompletedQuizToday(userId: string) {
    const today = new Date().toISOString().split("T")[0];

    const ref = doc(db, "users", userId, "dailyQuizzes", today);
    const snap = await getDoc(ref);

    return snap.exists();
}