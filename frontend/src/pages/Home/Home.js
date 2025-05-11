import React from 'react';
import {getWalletBalance} from '../../service/WalletService';
import WalletBalanceSearchComponent from "../../components/WalletBalanceSearchComponent";
import MineComponent from "../../components/MineComponent";
import styles from './Home.css';
import CreateWalletComponent from "../../components/CreateWalletComponent";
import TransactionComponent from "../../components/TransactionComponent";

const Home = () => (
    <div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <WalletBalanceSearchComponent />
            <MineComponent />
        </div>
    </div>
);

export default Home;
