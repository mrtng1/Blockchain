import React, { useState } from 'react';
import { newTransaction } from '../service/BlockchainService';
import { checkValidHashAddress } from '../service/Utils';

function TransactionComponent() {
    const [fromAddress, setFromAddress] = useState('');
    const [toAddress, setToAddress] = useState('');
    const [amount, setAmount] = useState('');
    const [senderPrivateKey, setSenderPrivateKey] = useState('');
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!fromAddress || !toAddress || !amount || !senderPrivateKey) {
            setError('All fields are required');
            return;
        }

        if (!checkValidHashAddress(fromAddress) || !checkValidHashAddress(toAddress)) {
            setError('Invalid address format');
            return;
        }

        if (isNaN(amount) || Number(amount) <= 0) {
            setError('Amount must be a positive number');
            return;
        }

        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            const result = await newTransaction(
                fromAddress,
                toAddress,
                Number(amount),
                senderPrivateKey
            );
            setMessage(result.message);
            // Clear form on success
            setFromAddress('');
            setToAddress('');
            setAmount('');
            setSenderPrivateKey('');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
            <div style={styles.frame}>
                <h1>Create Transaction</h1>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="fromAddress">From Address:</label>
                        <input
                            type="text"
                            id="fromAddress"
                            value={fromAddress}
                            onChange={(e) => setFromAddress(e.target.value)}
                            placeholder="Sender address"
                        />
                    </div>
                    <div>
                        <label htmlFor="toAddress">To Address:</label>
                        <input
                            type="text"
                            id="toAddress"
                            value={toAddress}
                            onChange={(e) => setToAddress(e.target.value)}
                            placeholder="Recipient address"
                        />
                    </div>
                    <div>
                        <label htmlFor="amount">Amount:</label>
                        <input
                            type="number"
                            id="amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            step="0.0001"
                        />
                    </div>
                    <div>
                        <label htmlFor="privateKey">Private Key:</label>
                        <input
                            type="password"
                            id="privateKey"
                            value={senderPrivateKey}
                            onChange={(e) => setSenderPrivateKey(e.target.value)}
                            placeholder="Sender private key"
                        />
                    </div>
                    <button type="submit" disabled={loading}>
                        {loading ? (
                            <div style={styles.loadingContainer}>
                                <div style={styles.spinner}></div>
                                <span>Processing...</span>
                            </div>
                        ) : (
                            'Send Transaction'
                        )}
                    </button>
                </form>

                {error && <p style={{ color: 'red' }}>{error}</p>}

                {message && (
                    <div>
                        <h2>Result</h2>
                        <p>{message}</p>
                    </div>
                )}
            </div>
        </>
    );
}

// Reuse the same styles object from MineComponent
const styles = {
    frame: {
        border: '2px solid #ccc',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        width: '400px',
        margin: '20px auto',
    },
    loadingContainer: {
        display: 'flex',
        alignItems: 'center',
    },
    spinner: {
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #3498db',
        borderRadius: '50%',
        width: '16px',
        height: '16px',
        animation: 'spin 1s linear infinite',
        marginRight: '8px',
    },
};

export default TransactionComponent;