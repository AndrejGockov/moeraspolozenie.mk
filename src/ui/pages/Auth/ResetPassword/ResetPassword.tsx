import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../../../firebase";
import "../Auth.css";

const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export function ResetPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleReset = async () => {
        if (submitting) return;

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
            setSubmitting(true);
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
                case "auth/too-many-requests":
                    setError("Too many attempts. Try again later.");
                    break;
                default:
                    setError("Something went wrong. Try again.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="formContent">
            <h1>Forgot Password</h1>

            {error && <p style={{ color: "red", fontWeight: 500 }}>{error}</p>}
            {message && <p style={{ color: "green", fontWeight: 500 }}>{message}</p>}

            <input
                type="email"
                placeholder="Enter your email"
                value={email}
                disabled={submitting}
                onChange={(e) => setEmail(e.target.value)}
            />

            <button
                className="primary-btn"
                onClick={handleReset}
                disabled={submitting}
                style={{ opacity: submitting ? 0.7 : 1, cursor: submitting ? "not-allowed" : "pointer" }}
            >
                {submitting ? "Sending..." : "Send reset email"}
            </button>
        </div>
    );
}
