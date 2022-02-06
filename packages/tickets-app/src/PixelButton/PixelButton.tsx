import React from "react";
import "./PixelButton.css";

export function PixelButton(props: {
    children: React.ReactNode;
    disabled?: boolean;
    style?: React.CSSProperties;
    onClick: () => void;
}) {
    return <button style={props.style} disabled={props.disabled} onClick={props.onClick} className="PixelButton">
        <div className="PixelButton-background">
        {props.children}
        </div>
        <div className="PixelButton-shadow"></div>
        <div className="PixelButton-bottom-right-px"></div>
        <div className="PixelButton-bottom-right-px-shadow"></div>
        <div className="PixelButton-bottom-right-px-inlay"></div>
        <div className="PixelButton-top-left-px"></div>
        <div className="PixelButton-top-left-px-inlay"></div>
    </button>;
}