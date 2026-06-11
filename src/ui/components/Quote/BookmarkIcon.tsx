type BookmarkIconProps = {
    filled?: boolean;
    className?: string;
};

export function BookmarkIcon({
                                 filled = false,
                                 className = "",
                             }: BookmarkIconProps) {
    return filled ? (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className={className}
        >
            <path
                fillRule="evenodd"
                d="M6.32 2.577a.75.75 0 0 1 .754.007l5.426 3.101 5.426-3.101a.75.75 0 0 1 1.127.65v16.143a.75.75 0 0 1-1.127.65l-5.426-3.101-5.426 3.101a.75.75 0 0 1-1.127-.65V3.227a.75.75 0 0 1 .39-.65Z"
                clipRule="evenodd"
            />
        </svg>
    ) : (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className={className}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
            />
        </svg>
    );
}