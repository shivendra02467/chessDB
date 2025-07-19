import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../authContext';

const Navbar = () => {
    const { isLoggedIn, logout } = useAuth();

    const [dark, setDark] = useState(() =>
        localStorage.getItem('theme') === 'dark'
    );

    useEffect(() => {
        document.body.classList.toggle('dark', dark);
        localStorage.setItem('theme', dark ? 'dark' : 'light');
    }, [dark]);

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
                        <Link to="/play" style={{
                            color: '#000000',
                            textDecoration: 'none',
                        }}>Play</Link>
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
                <div>
                    <button onClick={() => setDark(!dark)}>
                        🌙
                    </button>
                </div>
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
                    <button onClick={logout}>Logout</button>
                )}
            </div>
        </nav>
    );
};

export default Navbar;