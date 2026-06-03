import React from "react";

interface Props {
    quizzes: any[];
}

export function StreakStats({ quizzes }: Props) {
    const calculateCurrentStreak = () => {
        const dates = quizzes
            .map(q => new Date(q.id))
            .sort((a, b) => b.getTime() - a.getTime());

        if (!dates.length) return 0;

        let streak = 1;

        for (let i = 0; i < dates.length - 1; i++) {
            const current = new Date(dates[i]);
            const next = new Date(dates[i + 1]);

            current.setHours(0, 0, 0, 0);
            next.setHours(0, 0, 0, 0);

            const diff =
                (current.getTime() - next.getTime()) /
                (1000 * 60 * 60 * 24);

            if (diff === 1) streak++;
            else break;
        }

        return streak;
    };

    const calculateHighestStreak = () => {
        const dates = quizzes
            .map(q => new Date(q.id))
            .sort((a, b) => a.getTime() - b.getTime());

        if (!dates.length) return 0;

        let current = 1;
        let highest = 1;

        for (let i = 1; i < dates.length; i++) {
            const diff =
                (dates[i].getTime() - dates[i - 1].getTime()) /
                (1000 * 60 * 60 * 24);

            if (diff === 1) {
                current++;
                highest = Math.max(highest, current);
            } else {
                current = 1;
            }
        }

        return highest;
    };

    const currentStreak = calculateCurrentStreak();
    const highestStreak = calculateHighestStreak();

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 12,
                marginBottom: 24,
            }}
        >
            <StatCard
                title="Current Streak:"
                value={`🔥 ${currentStreak} days`}
            />

            <StatCard
                title="Best Streak:"
                value={`🏆 ${highestStreak} days`}
            />

            <StatCard
                title="Total Quizzes taken:"
                value={`📝 ${quizzes.length}`}
            />
        </div>
    );
}

function StatCard({
                      title,
                      value,
                  }: {
    title: string;
    value: string;
}) {
    return (
        <div
            style={{
                background: "#fff",
                border: "1px solid #edf2f7",
                borderRadius: 12,
                padding: 16,
            }}
        >
            <div
                style={{
                    fontSize: 12,
                    color: "#718096",
                    marginBottom: 6,
                }}
            >
                {title}
            </div>

            <div
                style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#2d3748",
                }}
            >
                {value}
            </div>
        </div>
    );
}