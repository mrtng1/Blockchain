import React from 'react';

import styles from './Transaction.css';
import TransactionComponent from "../../components/TransactionComponent";

const Transaction = () => (
    <div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <TransactionComponent />
        </div>
    </div>
);

export default Transaction;
