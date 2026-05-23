export function calculateAverageScore(answers: number[]): number {
    const total = answers.reduce((sum, v) => sum + v, 0);
    return Number((total / answers.length).toFixed(1));
}