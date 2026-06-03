import { useState, useEffect } from "react";

const hbscFacts = [
    "87% of children in North Macedonia live with both parents, showing strong family structures among youth.",
    "Teens in North Macedonia use electronic media for daily communication at nearly double the international average (boys 45%, girls 42% vs. avg. 26%/29%).",
    "42% of girls and 28% of boys aged 11–15 in North Macedonia report feeling stressed multiple times a week.",
    "The rate of stressed teens doubles from age 11 to age 15 — a critical window for building healthy coping habits.",
    "29% of boys and 44% of girls aged 11–15 in North Macedonia show signs of emotional difficulties.",
    "21% of boys and 27% of girls in North Macedonia have experienced depressive moods.",
    "15% of girls and 6% of boys aged 15 in North Macedonia face depressive episodes lasting several months.",
    "North Macedonia ranks among the highest in Europe for emotional difficulties in girls — far above international averages.",
    "Youth in North Macedonia report a very low rate (6%) of chronic illness compared to the US (15–18%) and Canada (30%).",
    "Daily breakfast eating has been declining in North Macedonia — especially among girls, dropping from 53% to 45% between 2002 and 2014.",
    "Physical activity among Macedonian youth declined steadily from 2006 to 2014, especially for boys.",
    "12% of boys and 6% of girls in North Macedonia smoked their first cigarette before age 13.",
    "North Macedonia ranks lowest out of 42 countries for physical activity in girls (only 6%), far below the European average of 36%.",
    "Teen wellbeing in North Macedonia is strongly linked to family communication and feeling supported at home.",
    "Feeling connected to your school and peers is one of the strongest protective factors for teen mental health in North Macedonia.",
    "54% of boys and 57% of girls in North Macedonia eat lunch with their parents daily — family meals are a key wellbeing factor.",
    "Only 32% of boys and 22% of girls in North Macedonia meet the recommended daily physical activity levels.",
    "53% of boys and 52% of girls in North Macedonia watch TV for 2+ hours on school days.",
    "Boys in North Macedonia are nearly twice as likely to get injured in a year as girls — almost 30% reported a medical injury.",
    "10% of boys and 13% of girls aged 11–15 in North Macedonia are on a diet, rising sharply among older teens.",
    "12% of boys and 5% of girls in North Macedonia have bullied another student at some point.",
    "18% of boys and 16% of girls in North Macedonia have been called hurtful names at school.",
    "57% of boys and 73% of girls in North Macedonia report feeling supported by their friends.",
    "Teens with higher family income in North Macedonia are significantly more likely to be physically active daily.",
    "Daily breakfast consumption is highest among 13-year-old boys (65%) and 11-year-old girls (69%) in North Macedonia — but drops sharply with age."
];

export function FunFact() {
    const [funFact, setFunFact] = useState("");

    useEffect(() => {
        const randomFact = hbscFacts[Math.floor(Math.random() * hbscFacts.length)];
        setFunFact(randomFact);
    }, []);

    return (
        <div className="home-fun-fact">
            <h3>Fun psychology fact by HBSC about teens in North Macedonia:</h3>
            <p>{funFact}</p>
        </div>
    );
}