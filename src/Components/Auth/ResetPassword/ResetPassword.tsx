import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../../firebase";
import "../Auth.css";

const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export function ResetPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleReset = async () => {
        setMessage("");
        setError("");

        if (!email) {
            setError("Please enter your email");
            return;
        }

        if (!isValidEmail(email)) {
            setError("Please enter a valid email address");
            return;
        }

        try {
            await sendPasswordResetEmail(auth, email);

            setMessage("If this email exists, a reset link has been sent.");
        } catch (err: any) {
            const code = err?.code;

            switch (code) {
                case "auth/user-not-found":
                    setMessage("If this email exists, a reset link has been sent.");
                    break;

                case "auth/invalid-email":
                    setError("Invalid email format");
                    break;

                default:
                    setError("Something went wrong. Try again.");
            }
        }
    };

    return (
        <div className="formContent">
            <h1>Forgot Password</h1>

            {error && <p style={{ color: "red" }}>{error}</p>}
            {message && <p style={{ color: "green" }}>{message}</p>}

            <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />

            <button className="primary-btn" onClick={handleReset}>
                Send reset email
            </button>
        </div>
    );
}