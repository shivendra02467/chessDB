import React from "react";

const Home = ({ isLoggedIn }) => {
    return (
        <div style={{ padding: "20px" }}>
            <h1>Welcome to chessDB </h1>
            <p>{isLoggedIn ? "You are logged in!" : "Please log in or register to continue."}</p>
        </div>
    );
};

export default Home;

