import React from "react";
import "./PixelBox.css"


export function PixelBox(props: {
    children: React.ReactNode;
    className?: string;
    background?: string;
    shadow?: string;
    border?: string;
    parentBackground?: string;
}) {
// return children wrapped in a div with a custom border
    return <div className={"PixelBox "+props.className}>
        <div style={{background: props.background || "#5BB66B"}} className="PixelBox-background"></div>
        <div style={{background: props.shadow || "#21865B"}} className="PixelBox-shadow"></div>
        <div style={{background: props.shadow || "#E5E5E5"}}  className="PixelBox-bottom-right-px"></div>
        <div style={{background: props.shadow || "#21865B"}} className="PixelBox-bottom-right-px-shadow"></div>
        <div style={{
                background: props.background || "#7DD88D",
                boxShadow: (props.background || "#7DD88D") + " 0.05ch 0.05ch",
            }} className="PixelBox-bottom-right-px-inlay"></div>
        <div  style={{background: props.shadow || "#E5E5E5"}} className="PixelBox-top-left-px"></div>
        <div style={{
                background: props.background || "#7DD88D",
            }} className="PixelBox-top-left-px-inlay"></div>
        <div className="PixelBox-content">
            {props.children}
        </div>
    </div>;
}