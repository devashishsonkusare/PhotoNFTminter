import React from "react";
import { ClipLoader } from "react-spinners";

const LoaderModal = () => {
    const loaderStyle = {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
        zIndex: 9999, // Ensure it's on top of everything
    };

    return (
        <div style={loaderStyle}>
            <ClipLoader size={50} color={"#FF5733"} loading={true} />
        </div>
    );
};

export default LoaderModal;
