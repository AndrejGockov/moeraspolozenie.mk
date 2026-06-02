import React from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import "./Home.css";

export function Home() {
    const navigate = useNavigate();
    const user = auth.currentUser;

    return (
        <div className="home-container">
            <h1 className="home-title">
                {user ? (
                    <>
                        Welcome back, <br />
                        {user.displayName || ""}
                    </>
                ) : (
                    <>
                        Your daily breather starts here 🌱
                    </>
                )}
            </h1>

            <p className="home-subtitle">
                Check how you are doing today so you can keep up with your mental health!
            </p>

            <button
                className="home-cta-btn"
                onClick={() => navigate("/quiz")}
            >
                Daily Check-Up
            </button>

            <div className="home-fun-fact">
                <h3>Fun facts about your psychology 🧠</h3>
                <p>
                    Teenagers aged 11-15 years old experience more emotional fluctuations because
                    their brain is still developing its emotional regulatory system.
                    Taking small daily breaks to <b>check in</b>, helps improve their self-awareness and reduces their baseline stress levels over time.
                </p>
            </div>

            <div className="home-insight-card">
                <h3>Today’s insight 🌱</h3>
                <p>
                    Checking in with yourself daily helps develop your <b>emotional intelligence</b>.
                    Even quick 5-minute daily self-inspections can help improve your overall mood stability, emotional awareness and your overall daily well-being.
                </p>
            </div>



        </div>
    );
}