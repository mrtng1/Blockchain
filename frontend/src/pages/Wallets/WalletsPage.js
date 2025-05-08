import React from 'react';

import styles from './WalletsPage.css';
import CreateWalletComponent from "../../components/CreateWalletComponent";
import WalletBalanceSearch from "../../components/WalletBalanceSearch";

const WalletsPage = () => (
    <div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <CreateWalletComponent />
            <WalletBalanceSearch />
        </div>
    </div>
);

export default WalletsPage;
