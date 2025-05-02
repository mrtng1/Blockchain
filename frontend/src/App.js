import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import Navbar from './components/Navbar';
import './App.css';
import { initAuth } from "./service/AuthService";

function App() {
    const [auth, setAuth] = useState({ isLoggedIn: false, username: null });

    useEffect(() => {
        initAuth().then(authState => {
            setAuth(authState);
        });
    }, []);

    return (
        <div className="App-bg">
            <Router>
                <Navbar auth={auth} />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="*" element={<h1>404 Not Found</h1>} />
                </Routes>
            </Router>
        </div>
    );
}

export default App;