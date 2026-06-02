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
                        Welcome back! <br />
                        {user.displayName || ""}
                    </>
                ) : (
                    <>
                        Your daily breather starts now!
                    </>
                )}
            </h1>

            <p className="home-subtitle">
                Check how well you're doing today and keep up your mental health ❤️
            </p>

            <button
                className="home-cta-btn"
                onClick={() => navigate("/quiz")}
            >
                Do your daily Wellness Quiz!
            </button>

            <div className="home-fun-fact">
                <h3>Fun facts about your psychology:</h3>
                <p>
                    <b>Teenagers</b> experience more emotional fluctuations than regular adults,
                    their brains are still developing their emotional regulation regions.
                    Taking <b>short daily check-in breaks</b>, develops your self-awareness and calms you down, improving your <b>mental health</b>.
                </p>
            </div>

            <div className="home-insight-card">
                <h3>Why you should join us?</h3>
                <p>
                    Even if you aren't a teenager, checking in with yourself develops your <b>emotional intelligence</b>, helping you recognize why you're feeling bad today.
                    Even a short daily 5-minute  self-inspection test can help you with your <b>mood</b>, <b>awareness</b> and your overall day to day <b>well-being</b>!
                </p>
            </div>



        </div>
    );
}