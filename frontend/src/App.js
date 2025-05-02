import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import Navbar from './components/Navbar';
import './App.css';

function App() {

    return (
        <div className="App-bg">
            <Router>
                <Navbar/>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="*" element={<h1>404 Not Found</h1>} />
                </Routes>
            </Router>
        </div>
    );
}

export default App;