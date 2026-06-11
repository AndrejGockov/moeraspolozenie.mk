import React, { useState } from "react";
import { db } from "../../../firebase";
import { doc, deleteDoc } from "firebase/firestore";
import { useAuth } from "../../../hooks/useAuth";

interface DeleteQuotePromptProps {
    isOpen: boolean;
    quoteData: { id: string; text: string; author: string } | null;
    onClose: () => void;
    onDeleteSuccess: (id: string) => void;
}

export function DeleteQuotePrompt({
                                      isOpen,
                                      quoteData,
                                      onClose,
                                      onDeleteSuccess,
                                  }: DeleteQuotePromptProps) {
    const { user } = useAuth();
    const [isDeleting, setIsDeleting] = useState(false);

    if (!isOpen || !quoteData) return null;

    const handleDelete = async () => {
        if (!user || isDeleting) return;

        setIsDeleting(true);
        try {
            // Target the quote document inside the subcollection
            const quoteDocRef = doc(db, "users", user.uid, "savedQuotes", quoteData.id);
            await deleteDoc(quoteDocRef);

            // Trigger the UI array split to slide it out from the dashboard list instantly
            onDeleteSuccess(quoteData.id);
            onClose();
        } catch (error) {
            console.error("Error deleting bookmarked quote:", error);
            alert("Could not remove bookmark. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                backgroundColor: "rgba(0, 0, 0, 0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
            }}
            onClick={onClose}
        >
            <div
                style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "24px",
                    padding: "40px 50px",
                    width: "90%",
                    maxWidth: "580px",
                    textAlign: "center",
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
                    position: "relative",
                    boxSizing: "border-box",
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Title */}
                <h2
                    style={{
                        fontFamily: '"Georgia", serif',
                        fontSize: "26px",
                        fontWeight: 700,
                        margin: "0 0 12px 0",
                        color: "#000000",
                    }}
                >
                    Delete Quote?
                </h2>

                {/* Subtitle Message */}
                <p
                    style={{
                        color: "#7f8c8d",
                        fontSize: "15px",
                        margin: "0 0 28px 0",
                        lineHeight: "1.4",
                    }}
                >
                    Are you sure you want to remove this quote from your dashboard?
                </p>

                {/* Quote Block Preview Frame */}
                <div
                    style={{
                        border: "1px solid rgba(0, 0, 0, 0.06)",
                        borderRadius: "16px",
                        padding: "24px",
                        backgroundColor: "#ffffff",
                        textAlign: "left",
                        margin: "0 0 32px 0",
                        boxShadow: "inset 0 2px 4px rgba(0,0,0,0.01)",
                    }}
                >
                    <p
                        style={{
                            fontFamily: '"Georgia", serif',
                            fontStyle: "italic",
                            fontSize: "16px",
                            color: "#2c3e50",
                            margin: "0 0 8px 0",
                            lineHeight: "1.6",
                        }}
                    >
                        "{quoteData.text}"
                    </p>
                    <span
                        style={{
                            color: "#7f8c8d",
                            fontSize: "13px",
                            fontWeight: 600,
                            letterSpacing: "0.5px",
                        }}
                    >
                        — {quoteData.author || "Anonymous"}
                    </span>
                </div>

                {/* Action Buttons Row */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "14px",
                        width: "100%",
                    }}
                >
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        style={{
                            border: "1px solid #e2e8f0",
                            padding: "12px 28px",
                            borderRadius: "12px",
                            fontSize: "15px",
                            fontWeight: 600,
                            backgroundColor: "#ffffff",
                            color: "#4a5568",
                            cursor: "pointer",
                            transition: "background-color 0.2s ease",
                            outline: "none",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8f9fa")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ffffff")}
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        style={{
                            border: "none",
                            padding: "12px 28px",
                            borderRadius: "12px",
                            fontSize: "15px",
                            fontWeight: 600,
                            backgroundColor: "#ff4d4f",
                            color: "#ffffff",
                            cursor: isDeleting ? "not-allowed" : "pointer",
                            transition: "background-color 0.2s ease, transform 0.1s ease",
                            outline: "none",
                            opacity: isDeleting ? 0.6 : 1,
                        }}
                        onMouseEnter={(e) => {
                            if (!isDeleting) e.currentTarget.style.backgroundColor = "#e03e3e";
                        }}
                        onMouseLeave={(e) => {
                            if (!isDeleting) e.currentTarget.style.backgroundColor = "#ff4d4f";
                        }}
                    >
                        {isDeleting ? "Deleting..." : "Delete"}
                    </button>
                </div>
            </div>
        </div>
    );
}