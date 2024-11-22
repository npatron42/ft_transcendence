import React from "react";
import "./css/errors.css";

const Error404 = () => {
    return (
        <div className="containerError">
            <div>
                <h1 className="titleError">Error 404</h1>
                <p className="PError">This page doesn’t seem to exist</p>
            </div>
        </div>
    );
};

export default Error404;
