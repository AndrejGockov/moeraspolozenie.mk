import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../../firebase";
import { useAuth } from "../../../hooks/useAuth";
import "./Navbar.css";
import { hasCompletedQuizToday } from "../../../utils/quizComplete";

export function Navbar() {
    const { user, loading } = useAuth();
    const [checkingQuiz, setCheckingQuiz] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    const handleQuizClick = async () => {
        if (!user) {
            setIsMenuOpen(false);
            navigate("/login");
            return;
        }

        setCheckingQuiz(true);
        const done = await hasCompletedQuizToday(user.uid);
        setCheckingQuiz(false);
        setIsMenuOpen(false);

        navigate(done ? "/quiz/completed" : "/quiz");
    };

    const handleNavigation = (path: string) => {
        setIsMenuOpen(false);
        navigate(path);
    };

    const handleLogout = async () => {
        try {
            const today = new Date().toISOString().split("T")[0];

            localStorage.removeItem("last_known_name");
            localStorage.removeItem("was_authenticated");
            localStorage.removeItem(`quiz_${today}`);

            if (user?.uid) {
                localStorage.removeItem(`savedQuote_${user.uid}_${today}`);
            }

            setIsMenuOpen(false);
            await signOut(auth);
            navigate("/");
        } catch (err) {
            console.error("Sign out error:", err);
        }
    };

    return (
        <nav className="navbar">
            <div className="nav-container">
                <div className="nav-left-group">
                    <Link to="/" className="nav-logo" onClick={() => setIsMenuOpen(false)}>
                        MoeRaspolozenie<span>.mk</span>
                    </Link>
                </div>

                {/* Hamburger Toggle Button */}
                <button
                    className={`nav-hamburger ${isMenuOpen ? "open" : ""}`}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle navigation menu"
                >
                    <span className="hamburger-bar"></span>
                    <span className="hamburger-bar"></span>
                    <span className="hamburger-bar"></span>
                </button>

                {/* Main Navigation Drawer */}
                <div className={`nav-responsive-wrapper ${isMenuOpen ? "active" : ""}`}>
                    <ul className="nav-menu">
                        <li>
                            <button className="nav-item" onClick={() => handleNavigation("/")}>
                                Home
                            </button>
                        </li>
                        <li>
                            <button className="nav-item" onClick={() => handleNavigation("/dashboard")}>
                                Dashboard
                            </button>
                        </li>
                        <li>
                            <button
                                className="nav-item"
                                onClick={handleQuizClick}
                                disabled={checkingQuiz}
                                style={{ opacity: checkingQuiz ? 0.6 : 1 }}
                            >
                                Daily Quiz
                            </button>
                        </li>
                        <li>
                            <button className="nav-item" onClick={() => handleNavigation("/quote")}>
                                Today's Quote
                            </button>
                        </li>
                    </ul>

                    <div className="nav-right-group">
                        {loading ? null : user ? (
                            <div className="user-profile-zone">
                                <span className="welcome-user">
                                    Hi, {user.displayName || "User"}
                                </span>
                                <button onClick={handleLogout} className="logout-btn">
                                    Log Out
                                </button>
                            </div>
                        ) : (
                            <div className="auth-actions">
                                <Link to="/login" className="nav-link-btn" onClick={() => setIsMenuOpen(false)}>
                                    Login
                                </Link>
                                <Link to="/register" className="nav-btn" onClick={() => setIsMenuOpen(false)}>
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}