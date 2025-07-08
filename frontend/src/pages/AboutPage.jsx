import React, { useEffect } from "react";

const About = () => {
    useEffect(() => {
        document.title = 'About';
    }, []);
    return (
        <div style={{ padding: "20px", textAlign: 'center' }}>
            <h1>This is chessDB,</h1>
            <p>View games from a database of classical chess games of strong players, and analyze with stockfish 17.</p>
        </div>
    );
};

export default About;