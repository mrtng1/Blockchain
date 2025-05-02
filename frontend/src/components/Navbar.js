import React from 'react';
import { Link } from 'react-router-dom';
import { login, logout } from '../service/AuthService';

const Navbar = ({ auth }) => {
    const buttonStyle = {
        background: 'none',
        border: '1px solid white',
        color: 'white',
        padding: '0.5rem 1rem',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
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
            <div style={{ display: 'flex', gap: '1rem', marginLeft: 'auto' }}>
                <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
                    Home
                </Link>
                {auth.isLoggedIn ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ color: '#00ff9d' }}>
                            Welcome, {auth.username}
                        </span>
                        <button
                            onClick={logout}
                            style={buttonStyle}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#ffffff22'}
                            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                            Logout
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={login}
                        style={buttonStyle}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#ffffff22'}
                        onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                        Login
                    </button>
                )}
            </div>
        </nav>
    );
};

export default Navbar;