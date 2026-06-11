import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import "./Home.css";
import { FunFact } from "../../components/FunFact/FunFact";

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
        if (loading) return;
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

            <button
                className={`home-cta-btn ${loading ? "btn-loading" : ""}`}
                onClick={handleCtaClick}
                disabled={loading && !cachedName}
            >
                {loading && !cachedName ? (
                    <span className="btn-spinner"></span>
                ) : user || cachedName ? (
                    "Do your daily Wellness Quiz!"
                ) : (
                    "Join now & check your mood!"
                )}
            </button>

            <div className="home-fun-fact">
                <p>
                    <strong>Fun fact: </strong>
                    <FunFact />
                </p>
                <span className="fact-source-footer">
                    By HBSC about teens in North Macedonia
                </span>
            </div>
        </div>
    );
}
