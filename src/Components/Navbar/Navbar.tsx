import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { auth } from '../../firebase';
import './Navbar.css';

export function Navbar() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });

        return () => unsubscribe();
    }, []);

    const handleLogout = () => {
        signOut(auth).catch((error) => console.error(error));
    };

    return (
        <nav className="navbar">
            <div className="nav-container">

                <div className="nav-left-group">
                    <Link to="/" className="nav-logo">
                        MoeZadovolstvo<span>.mk</span>
                    </Link>

                    <ul className="nav-menu">
                        <li><Link to="/" className="nav-item">Home</Link></li>
                        <li><Link to="/dashboard" className="nav-item">Dashboard</Link></li>
                        <li><Link to="/quiz" className="nav-item">Daily Quiz</Link></li>
                        <li><Link to="/quote" className="nav-item">Daily Quote</Link></li>
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