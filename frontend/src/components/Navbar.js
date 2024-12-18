import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ isLoggedIn, setIsLoggedIn }) => {
    const handleLogout = () => {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        window.location.href = "/";
    };
    return (
        <nav style={styles.nav}>
            <div style={styles.leftAligned}>
                <Link to="/" style={styles.name}>chessDB</Link>
                <Link to="/about" style={styles.link}>About</Link>
                {isLoggedIn && (
                    <>
                        <Link to="/database" style={styles.link}>Database</Link>
                        <Link to="/analysis" style={styles.link}>Analysis</Link>
                    </>
                )}
            </div>
            <div style={styles.rightAligned}>
                {!isLoggedIn ? (
                    <>
                        <Link to="/login" style={styles.link}>Login</Link>
                        <Link to="/register" style={styles.link}>Register</Link>
                    </>
                ) : (
                    <button onClick={handleLogout}>Logout</button>
                )}
            </div>
        </nav>
    );
};

const styles = {
    nav: {
        display: 'flex',
        justifyContent: 'space-between',
        backgroundColor: '#cccccc',
        padding: '10px 20px',
    },
    leftAligned: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
    },
    name: {
        color: '#000000',
        textDecoration: 'none',
        fontSize: '24px',
    },
    rightAligned: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
    },
    link: {
        color: '#000000',
        textDecoration: 'none',
        fontSize: '16px',
    },
};

export default Navbar;