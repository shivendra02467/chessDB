import React, { useEffect } from "react";
import { useAuth } from "../authContext";

const Home = () => {
    const { isLoggedIn } = useAuth();

    useEffect(() => {
        document.title = 'chessDB';
    }, []);

    return (
        <div style={{ padding: "20px", textAlign: 'center', }}>
            <h1>Welcome to chessDB </h1>
            <p>{isLoggedIn ? "You are logged in!" : "Please log in or register to continue."}</p>
        </div>
    );
};

export default Home;

