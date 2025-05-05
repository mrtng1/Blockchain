import React from 'react';
import {getWalletBalance} from '../../service/WalletService';
import WalletBalanceSearch from "../../components/WalletBalanceSearch";
import MineComponent from "../../components/MineComponent";
import styles from './Home.css';
import CreateWalletComponent from "../../components/CreateWalletComponent";

const Home = () => (
    <div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <WalletBalanceSearch />
            <MineComponent />
            <CreateWalletComponent />
        </div>
    </div>
);

export default Home;
