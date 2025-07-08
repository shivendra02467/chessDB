import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ isLoggedIn, setIsLoggedIn }) => {
    const handleLogout = () => {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        window.location.href = "/";
    };
    return (
        <nav style={{
            display: 'flex',
            justifyContent: 'space-between',
            backgroundColor: '#cccccc',
            padding: '10px 20px',
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
            }}>
                <Link to="/" style={{
                    fontSize: '24px',
                    color: '#000000',
                    textDecoration: 'none',
                }}>chessDB</Link>
                <Link to="/about" style={{
                    color: '#000000',
                    textDecoration: 'none',
                }}>About</Link>
                {isLoggedIn && (
                    <>
                        <Link to="/database" style={{
                            color: '#000000',
                            textDecoration: 'none',
                        }}>Database</Link>
                        <Link to="/analysis" style={{
                            color: '#000000',
                            textDecoration: 'none',
                        }}>Analysis</Link>
                    </>
                )}
            </div>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
            }}>
                {!isLoggedIn ? (
                    <>
                        <Link to="/login" style={{
                            color: '#000000',
                            textDecoration: 'none',
                        }}>Login</Link>
                        <Link to="/register" style={{
                            color: '#000000',
                            textDecoration: 'none',
                        }}>Register</Link>
                    </>
                ) : (
                    <button onClick={handleLogout}>Logout</button>
                )}
            </div>
        </nav>
    );
};

export default Navbar;