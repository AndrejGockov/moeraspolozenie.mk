import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "./Home.css";
import { FunFact } from "../FunFact/FunFact";


export function Home() {
    const navigate = useNavigate();
    const { user, loading } = useAuth();

    const [cachedName, setCachedName] = useState(() => {
        return localStorage.getItem("last_known_name") || "";
    });

    useEffect(() => {
        if (!loading) {
            if (user) {
                const name = user.displayName || "friend";
                localStorage.setItem("last_known_name", name);
                setCachedName(name);
            } else {
                localStorage.removeItem("last_known_name");
                setCachedName("");
            }
        }
    }, [user, loading]);

    const renderTitle = () => {
        if (loading && cachedName) {
            return (
                <>
                    Welcome back! <br />
                    <span className="user-name-highlight">{cachedName}</span>
                </>
            );
        }

        if (user) {
            return (
                <>
                    Welcome back! <br />
                    <span className="user-name-highlight">{user.displayName || "friend"}</span>
                </>
            );
        }

        return "Your daily breather starts now!";
    };

    const handleCtaClick = () => {
        if (loading) return; // Block clicks while auth is resolving
        if (user) {
            navigate("/quiz");
        } else {
            navigate("/register");
        }
    };

    return (
        <div className="home-container">
            <h1 className="home-title">
                {renderTitle()}
            </h1>

            <p className="home-subtitle">
                Check how well you're doing today and keep up your mental health ❤️
            </p>

            {/* 🎯 Updated button: text stays fixed, spinner shows conditionally */}
            <button
                className={`home-cta-btn ${loading ? "btn-loading" : ""}`}
                onClick={handleCtaClick}
                disabled={loading && !cachedName} // Only completely disable if we have zero cached data
            >
                {loading && !cachedName ? (
                    <span className="btn-spinner"></span>
                ) : user || cachedName ? (
                    "Do your daily Wellness Quiz!"
                ) : (
                    "Join now & check your mood!"
                )}
            </button>

            <FunFact />

            {/*<div className="home-insight-card">*/}
            {/*    <h3>Why you should join us?</h3>*/}
            {/*    <p>*/}
            {/*        Even if you aren't a teenager, checking in with yourself develops your <b>emotional intelligence</b>, helping you recognize why you're feeling bad today.*/}
            {/*        Even a short daily 5-minute self-inspection test can help you with your <b>mood</b>, <b>awareness</b> and your overall day to day <b>well-being</b>!*/}
            {/*    </p>*/}
            {/*</div>*/}
        </div>
    );
}
