export function getRecommendation(score: number): string {
    if (score <= 2) {
        return "Today seems emotionally heavy for you. Try to slow down and give yourself a break. Simple things like resting, going for a short walk, listening to music, or doing something calm can help you feel a bit more grounded.";
    }

    if (score <= 3) {
        return "Today feels a bit neutral or mixed. That is completely normal. You might feel better by doing something small for yourself like talking to someone, going outside for a bit, or doing a hobby you enjoy.";
    }

    if (score <= 4) {
        return "You are having a stable and good day. Keep doing the things that help you feel balanced, like staying active, keeping a routine, and taking short breaks when needed.";
    }

    return "You are in a really good mood today. Take a moment to notice what is going well and enjoy it. These small positives are worth recognizing and can help you stay balanced.";
}