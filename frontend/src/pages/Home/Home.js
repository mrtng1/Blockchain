import React from 'react';
import {getWalletBalance} from '../../service/WalletService';
import WalletBalanceSearch from "../../components/WalletBalanceSearch";
import MineComponent from "../../components/MineComponent";
import styles from './Home.css';

const Home = () => (
    <div>
        <h1>Welcome to the Home Page</h1>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <WalletBalanceSearch />
            <MineComponent />
        </div>
    </div>
);

export default Home;
