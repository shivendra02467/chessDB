import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../authContext';

const Navbar = () => {
    const { isLoggedIn, logout } = useAuth();
    const location = useLocation();

    const [dark, setDark] = useState(() =>
        localStorage.getItem('theme') === 'dark'
    );

    useEffect(() => {
        document.body.classList.toggle('dark', dark);
        localStorage.setItem('theme', dark ? 'dark' : 'light');
    }, [dark]);

    const getLinkClass = (path) => {
        const base = 'text-sm font-medium transition-colors duration-200';
        const active = 'text-blue-600 dark:text-blue-400';
        const inactive = 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white';

        return `${base} ${location.pathname === path ? active : inactive}`;
    };

    return (
        <nav className='sticky top-0 z-50 w-full bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='flex h-16 items-center justify-between'>
                    <div className='flex items-center gap-8'>
                        <Link
                            to='/'
                            className='text-2xl font-bold tracking-tight text-gray-900 dark:text-white hover:opacity-80 transition-opacity'
                        >
                            chessDB
                        </Link>
                        <div className='flex items-center gap-6 overflow-x-auto no-scrollbar'>
                            <Link className={getLinkClass('/about')} to='/about'>
                                About
                            </Link>

                            {isLoggedIn && (
                                <>
                                    <Link className={getLinkClass('/play')} to='/play'>
                                        Play
                                    </Link>
                                    <Link className={getLinkClass('/database')} to='/database'>
                                        Database
                                    </Link>
                                    <Link className={getLinkClass('/analysis')} to='/analysis'>
                                        Analysis
                                    </Link>
                                    <Link className={getLinkClass('/mygames')} to='/mygames'>
                                        MyGames
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                    <div className='flex items-center gap-4'>
                        <button
                            onClick={() => setDark(!dark)}
                            title={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 ease-in-out focus:ring-2 focus:ring-offset-2
                                    ${dark
                                    ? 'text-yellow-300 hover:text-yellow-200 hover:bg-gray-900 focus:ring-yellow-400 ring-offset-gray-900'
                                    : 'text-slate-700 hover:text-black hover:bg-gray-200 focus:ring-slate-500 ring-offset-white'
                                }`
                            }
                        >
                            {dark ? '☼' : '☾'}
                        </button>
                        {!isLoggedIn ? (
                            <div className='flex items-center gap-3'>
                                <Link
                                    to='/login'
                                    className='text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors'
                                >
                                    Login
                                </Link>
                                <Link
                                    to='/register'
                                    className='px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm'
                                >
                                    Register
                                </Link>
                            </div>
                        ) : (
                            <button
                                onClick={logout}
                                className='px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm'
                            >
                                Logout
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;