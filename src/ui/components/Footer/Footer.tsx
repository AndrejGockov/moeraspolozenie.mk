import "./Footer.css";

export function Footer() {
    return (
        <footer className="footer">
            <div className="footer-content">
                 <small>
                    © {new Date().getFullYear()} MoeRaspolozenie.mk
                </small>
            </div>
        </footer>
    );
}