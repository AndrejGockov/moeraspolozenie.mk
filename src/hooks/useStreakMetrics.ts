import { useMemo } from "react";

export function useStreakMetrics(quizData: any[]) {
    const streak = useMemo(() => {
        if (quizData.length === 0) return { current: 0, max: 0 };
        const sortedDates = quizData
            .map(q => q.id)
            .filter(id => /^\d{4}-\d{2}-\d{2}$/.test(id))
            .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

        if (sortedDates.length === 0) return { current: 0, max: 0 };
        const uniqueDates = Array.from(new Set(sortedDates));

        let currentStreak = 0;
        let maxStreak = 0;
        let tempStreak = 0;

        const todayStr = new Date().toISOString().split("T")[0];
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        if (uniqueDates[0] === todayStr || uniqueDates[0] === yesterdayStr) {
            let expectedDate = new Date(uniqueDates[0]);
            for (let i = 0; i < uniqueDates.length; i++) {
                const currentDate = new Date(uniqueDates[i]);
                if (Math.ceil(Math.abs(expectedDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)) <= 1) {
                    currentStreak++;
                    expectedDate = currentDate;
                } else {
                    break;
                }
            }
        }

        let trackDate = new Date(uniqueDates[uniqueDates.length - 1]);
        for (let i = uniqueDates.length - 1; i >= 0; i--) {
            const curr = new Date(uniqueDates[i]);
            if (Math.ceil(Math.abs(curr.getTime() - trackDate.getTime()) / (1000 * 60 * 60 * 24)) <= 1) {
                tempStreak++;
                maxStreak = Math.max(maxStreak, tempStreak);
            } else {
                tempStreak = 1;
            }
            trackDate = curr;
        }
        return { current: currentStreak, max: maxStreak };
    }, [quizData]);

    const stats = useMemo(() => {
        const scores = quizData.map((q) => q.avgScore).filter((v): v is number => typeof v === "number");
        const hasScores = scores.length > 0;
        const avg = hasScores ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
        const lowest = hasScores ? Math.min(...scores) : 0;
        const highest = hasScores ? Math.max(...scores) : 0;

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const weeklyScores = quizData.filter((q) => new Date(q.id) >= sevenDaysAgo && typeof q.avgScore === "number").map((q) => q.avgScore);
        const weeklyAvg = weeklyScores.length > 0 ? weeklyScores.reduce((a, b) => a + b, 0) / weeklyScores.length : null;

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const monthlyScores = quizData.filter((q) => new Date(q.id) >= thirtyDaysAgo && typeof q.avgScore === "number").map((q) => q.avgScore);
        const monthlyAvg = monthlyScores.length > 0 ? monthlyScores.reduce((a, b) => a + b, 0) / monthlyScores.length : null;

        const sad = scores.filter(s => s <= 2.5).length;
        const neutral = scores.filter(s => s > 2.5 && s < 4.5).length;
        const happy = scores.filter(s => s >= 4.5).length;

        const pieData = [
            { name: "Sad days", value: sad, fill: "#ff4d4f" },
            { name: "Neutral days", value: neutral, fill: "#ffa940" },
            { name: "Happy days", value: happy, fill: "#52c41a" }
        ].filter(item => item.value > 0);

        return { avg, lowest, highest, weeklyAvg, monthlyAvg, sad, neutral, happy, pieData };
    }, [quizData]);

    return { streak, ...stats };
}