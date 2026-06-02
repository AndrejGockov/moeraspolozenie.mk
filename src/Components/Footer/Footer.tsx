import "./Footer.css";

export function Footer() {
    return (
        <footer className="footer">
            <div className="footer-content">
                 <small>
                    © {new Date().getFullYear()} MoeZadovolstvo.mk
                </small>
            </div>
        </footer>
    );
}