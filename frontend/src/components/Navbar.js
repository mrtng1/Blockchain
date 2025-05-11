// src/components/Navbar.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import authService from '../service/AuthService';

export default function Navbar() {
    const [isLoggedIn, setIsLoggedIn] = useState(!!authService.getToken());
    const [username, setUsername] = useState('');

    useEffect(() => {
        if (authService.keycloak.authenticated) {
            setIsLoggedIn(true);
            setUsername(authService.keycloak.tokenParsed?.preferred_username || '');
        }

        const refreshInterval = setInterval(() => {
            if (authService.keycloak.authenticated && !isLoggedIn) {
                setIsLoggedIn(true);
                setUsername(authService.keycloak.tokenParsed?.preferred_username || '');
            }
            if (!authService.keycloak.authenticated && isLoggedIn) {
                setIsLoggedIn(false);
                setUsername('');
            }
        }, 1000);

        return () => clearInterval(refreshInterval);
    }, [isLoggedIn]);

    const handleLogin = () => authService.login();
    const handleLogout = () => authService.logout();

    const buttonStyle = {
        background: 'none',
        border: '1px solid white',
        color: 'white',
        padding: '0.5rem 1rem',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        backgroundColor: 'transparent',
    };

    return (
        <nav style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2rem',
            padding: '1rem',
            backgroundColor: '#121618',
            color: 'white'
        }}>
            <h3 style={{ margin: 0 }}>Crypto-blockchain</h3>

            <div style={{ display: 'flex', gap: '1rem' }}>
                <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
                    Home
                </Link>
                <Link to="/transaction" style={{ color: 'white', textDecoration: 'none' }}>
                    Pay
                </Link>
                <Link to="/wallets" style={{ color: 'white', textDecoration: 'none' }}>
                    Wallets
                </Link>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: 'auto' }}>
                {isLoggedIn ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ color: '#00ff9d' }}>Logged in as: {username}</span>
                        <button
                            onClick={handleLogout}
                            style={buttonStyle}
                            onMouseOver={e => e.currentTarget.style.backgroundColor = '#ffffff22'}
                            onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            Logout
                        </button>
                    </div>
                ) :
                    (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ color: '#00ff9d' }}>Guest</span>
                            <button
                                onClick={handleLogin}
                                style={buttonStyle}
                                onMouseOver={e => e.currentTarget.style.backgroundColor = '#ffffff22'}
                                onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                Login
                            </button>
                        </div>

                )}
            </div>
        </nav>
    );
}