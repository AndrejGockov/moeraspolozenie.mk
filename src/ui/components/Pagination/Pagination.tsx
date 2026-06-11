import React from "react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number | ((prev: number) => number)) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    if (totalPages <= 1) return null;

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 24 }}>
            {/* Previous Button */}
            <button
                disabled={currentPage === 1}
                onClick={() => onPageChange(prev => Math.max(prev - 1, 1))}
                style={{
                    padding: "6px 12px",
                    borderRadius: 6,
                    border: "1px solid #e2e8f0",
                    background: currentPage === 1 ? "#f1f5f9" : "white",
                    color: currentPage === 1 ? "#94a3b8" : "#334155",
                    cursor: currentPage === 1 ? "not-allowed" : "pointer",
                    fontWeight: 600,
                    fontSize: 13
                }}
            >
                Previous
            </button>

            {/* Page Numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    style={{
                        width: 32,
                        height: 32,
                        borderRadius: 6,
                        border: "none",
                        background: currentPage === page ? "#007bff" : "#eee",
                        color: currentPage === page ? "white" : "#333",
                        fontWeight: 600,
                        cursor: "pointer",
                        fontSize: 13
                    }}
                >
                    {page}
                </button>
            ))}

            {/* Next Button */}
            <button
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(prev => Math.min(prev + 1, totalPages))}
                style={{
                    padding: "6px 12px",
                    borderRadius: 6,
                    border: "1px solid #e2e8f0",
                    background: currentPage === totalPages ? "#f1f5f9" : "white",
                    color: currentPage === totalPages ? "#94a3b8" : "#334155",
                    cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                    fontWeight: 600,
                    fontSize: 13
                }}
            >
                Next
            </button>
        </div>
    );
}