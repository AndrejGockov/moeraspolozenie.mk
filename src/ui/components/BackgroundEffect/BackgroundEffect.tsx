import "./BackgroundEffect.css";

export function BackgroundEffect() {
    return (
        <div className="background-effect" aria-hidden="true">
            <div className="background-effect-circle c1" />
            <div className="background-effect-circle c2" />
            <div className="background-effect-circle c3" />
        </div>
    );
}