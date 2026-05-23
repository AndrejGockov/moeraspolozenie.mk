import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../../firebase";
import "../Auth.css";

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

        try {
            await sendPasswordResetEmail(auth, email);
            console.log("Reset email sent to:", email);
            setMessage("Check your email (and spam folder)");
        } catch (err: any) {
            console.error(err);
            setError(err.message);
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
                onChange={(e) => setEmail(e.target.value)}
            />

            <button className="primary-btn" onClick={handleReset}>
                Send reset email
            </button>
        </div>
    );
}