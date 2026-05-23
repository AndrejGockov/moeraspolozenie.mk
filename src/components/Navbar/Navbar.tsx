import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { auth } from "../../firebase";
import "./Navbar.css";
import { hasCompletedQuizToday } from "../../utils/quizComplete";

export function Navbar() {
    const [user, setUser] = useState<User | null>(null);
    const [checkingQuiz, setCheckingQuiz] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });

        return () => unsubscribe();
    }, []);


    const handleQuizClick = async () => {
        const currentUser = auth.currentUser;

        if (!currentUser) {
            navigate("/login");
            return;
        }

        setCheckingQuiz(true);

        const done = await hasCompletedQuizToday(currentUser.uid);

        setCheckingQuiz(false);

        navigate(done ? "/quiz/completed" : "/quiz");
    };

    const handleLogout = async () => {
        await signOut(auth);
        navigate("/");
    };

    return (
        <nav className="navbar">
            <div className="nav-container">

                <div className="nav-left-group">
                    <Link to="/" className="nav-logo">
                        MoeZadovolstvo<span>.mk</span>
                    </Link>

                    <ul className="nav-menu">

                        <li>
                            <button className="nav-item" onClick={() => navigate("/")}>
                                Home
                            </button>
                        </li>

                        <li>
                            <button className="nav-item" onClick={() => navigate("/dashboard")}>
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
                            <button className="nav-item" onClick={() => navigate("/quote")}>
                                Daily Quote
                            </button>
                        </li>

                    </ul>
                </div>

                <div className="nav-right-group">
                    {user ? (
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
                            <Link to="/login" className="nav-link-btn">
                                Login
                            </Link>

                            <Link to="/register" className="nav-btn">
                                Register
                            </Link>
                        </div>
                    )}
                </div>

            </div>
        </nav>
    );
}