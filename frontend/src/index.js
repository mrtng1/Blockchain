import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import authService from './service/AuthService';

const root = ReactDOM.createRoot(document.getElementById('root'));

// Wrap the app rendering in an async initialization function
const initApp = async () => {
    try {
        await authService.init();
        root.render(
            <React.StrictMode>
                <App />
            </React.StrictMode>
        );
    } catch (error) {
        console.error('Authentication initialization failed:', error);
        root.render(
            <div className="error-container">
                <h1>Application Failed to Initialize</h1>
                <p>Please refresh the page or try again later.</p>
            </div>
        );
    }
};

// Start the initialization process
initApp();

reportWebVitals();