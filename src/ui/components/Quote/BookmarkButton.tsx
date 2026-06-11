import React from "react";
import { BookmarkIcon } from "./BookmarkIcon";

interface BookmarkButtonProps {
    quoteId: string;
    isSavedByDefault?: boolean;
    disabled?: boolean;
    onClick?: (e: React.MouseEvent) => void;
}

export function BookmarkButton({
                                   quoteId,
                                   isSavedByDefault = true,
                                   disabled = false,
                                   onClick
                               }: BookmarkButtonProps) {

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevents clicking the row or card background
        if (onClick) {
            onClick(e);
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={disabled}
            title="Remove from bookmarks"
            className="bookmark-btn"
            style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0",
                cursor: disabled ? "not-allowed" : "pointer",
                color: isSavedByDefault ? "#2563eb" : "#94a3b8",
                outline: "none",
                opacity: disabled ? 0.6 : 1,
                flexShrink: 0,
                transition: "background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease"
            }}
            onMouseEnter={(e) => {
                if (!disabled) {
                    e.currentTarget.style.backgroundColor = "#eff6ff";
                    e.currentTarget.style.borderColor = "#93c5fd";
                }
            }}
            onMouseLeave={(e) => {
                if (!disabled) {
                    e.currentTarget.style.backgroundColor = "#ffffff";
                    e.currentTarget.style.borderColor = "#e2e8f0";
                }
            }}
        >
            <BookmarkIcon
                filled={isSavedByDefault}
                className="bookmark-icon"
            />
        </button>
    );
}