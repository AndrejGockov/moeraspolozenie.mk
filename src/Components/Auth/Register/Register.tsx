import React, { useState } from "react";
import {
    createUserWithEmailAndPassword,
    updateProfile,
    signInWithPopup,
    GoogleAuthProvider
} from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../../../firebase";
import "../Auth.css";

const getRegisterErrorMessage = (error: any) => {
    switch (error?.code) {
        case "auth/email-already-in-use":
            return "This email is already registered";
        case "auth/invalid-email":
            return "Invalid email format";
        case "auth/weak-password":
            return "Password should be at least 6 characters";
        default:
            return "Failed to create account. Try again";
    }
};

export function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!username || !email || !password) {
            setError("All fields are required");
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

            await updateProfile(userCredential.user, {
                displayName: username
            });

            navigate("/", { replace: true });
        } catch (err: any) {
            setError(getRegisterErrorMessage(err));
        }
    };

    const handleGoogle = async () => {
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            navigate("/", { replace: true });
        } catch (err: any) {
            setError(getRegisterErrorMessage(err));
        }
    };

    return (
        <div className="formContent">
            <h1>Create an account</h1>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <form className="log" onSubmit={handleRegister}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button className="primary-btn" type="submit">
                    Register
                </button>
            </form>

            <button onClick={handleGoogle} className="google-btn">
                <span className="google-icon-wrapper">
                    <svg className="google-icon" viewBox="0 0 533.5 544.3">
                        <path fill="#4285F4" d="M533.5 278.4c0-18.5-1.5-37-4.7-54.9H272v103.9h146.9c-6.3 34-25.2 62.8-53.8 82v68h86.9c50.8-46.8 81.5-115.8 81.5-199z"/>
                        <path fill="#34A853" d="M272 544.3c72.6 0 133.5-23.9 178-64.9l-86.9-68c-24.1 16.2-55 25.7-91.1 25.7-70 0-129.4-47.2-150.7-110.6H32.9v69.3C77.5 486.1 167.5 544.3 272 544.3z"/>
                        <path fill="#FBBC05" d="M121.3 326.5c-10.5-31.4-10.5-65.4 0-96.8v-69.3H32.9c-38.7 77.2-38.7 168.2 0 245.4l88.4-69.3z"/>
                        <path fill="#EA4335" d="M272 107.7c39.4 0 75 13.6 103 40.3l77.2-77.2C405.5 24.6 344.6 0 272 0 167.5 0 77.5 58.2 32.9 150.8l88.4 69.3C142.6 155 202 107.7 272 107.7z"/>
                    </svg>
                </span>
                Register with Google
            </button>

            <p>
                Already have an account? <Link to="/login">Login</Link>
            </p>
        </div>
    );
}