import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../authContext';

const Navbar = () => {
    const { isLoggedIn, logout } = useAuth();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    const [dark, setDark] = useState(() =>
        localStorage.getItem('theme') === 'dark'
    );

    useEffect(() => {
        document.body.classList.toggle('dark', dark);
        localStorage.setItem('theme', dark ? 'dark' : 'light');
    }, [dark]);

    useEffect(() => {
        setIsOpen(false);
    }, [location.pathname]);

    const getLinkClass = (path, isMobile = false) => {
        const base = 'font-medium transition-colors duration-200';
        const active = 'text-blue-600 dark:text-blue-400';
        const inactive = 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white';

        const mobileStyles = isMobile ? 'block px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-base' : 'text-sm';

        return `${base} ${mobileStyles} ${location.pathname === path ? active : inactive}`;
    };

    const navLinks = [
        { name: 'About', path: '/about', public: true },
        { name: 'Play', path: '/play', public: false },
        { name: 'Database', path: '/database', public: false },
        { name: 'Analysis', path: '/analysis', public: false },
        { name: 'MyGames', path: '/mygames', public: false },
    ];

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
                        <div className='hidden md:flex items-center gap-6'>
                            {navLinks.map((link) => (
                                (link.public || isLoggedIn) && (
                                    <Link key={link.name} className={getLinkClass(link.path)} to={link.path}>
                                        {link.name}
                                    </Link>
                                )
                            ))}
                        </div>
                    </div>
                    <div className='flex items-center gap-4'>
                        <button
                            onClick={() => setDark(!dark)}
                            title={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            className={`p-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
                                ${dark
                                    ? 'text-yellow-300 hover:bg-gray-700 focus:ring-yellow-400 ring-offset-gray-900'
                                    : 'text-slate-700 hover:bg-gray-100 focus:ring-slate-500 ring-offset-white'
                                }`}
                        >
                            {dark ? (
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                                    />
                                </svg>
                            ) : (
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                                    />
                                </svg>
                            )}
                        </button>
                        <div className="hidden md:flex items-center gap-3">
                            {!isLoggedIn ? (
                                <>
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
                                </>
                            ) : (
                                <button
                                    onClick={logout}
                                    className='px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm'
                                >
                                    Logout
                                </button>
                            )}
                        </div>
                        <div className='flex md:hidden'>
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className='inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none'
                            >
                                <span className="sr-only">Open main menu</span>
                                {!isOpen ? (
                                    <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                ) : (
                                    <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {isOpen && (
                <div className='md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700'>
                    <div className='px-2 pt-2 pb-3 space-y-1'>
                        {navLinks.map((link) => (
                            (link.public || isLoggedIn) && (
                                <Link
                                    key={link.name}
                                    className={getLinkClass(link.path, true)}
                                    to={link.path}
                                    onClick={() => setIsOpen(false)}
                                >
                                    {link.name}
                                </Link>
                            )
                        ))}
                        <div className="pt-4 pb-2 border-t border-gray-200 dark:border-gray-700 mt-2">
                            {!isLoggedIn ? (
                                <div className="flex flex-col gap-2 px-3">
                                    <Link
                                        to='/login'
                                        onClick={() => setIsOpen(false)}
                                        className='block text-center w-full px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition'
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to='/register'
                                        onClick={() => setIsOpen(false)}
                                        className='block text-center w-full px-4 py-2 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition'
                                    >
                                        Register
                                    </Link>
                                </div>
                            ) : (
                                <div className="px-3">
                                    <button
                                        onClick={() => { logout(); setIsOpen(false); }}
                                        className='block w-full text-center px-4 py-2 text-base font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition'
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;