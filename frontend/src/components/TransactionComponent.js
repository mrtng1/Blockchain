import React, { useState, useEffect } from 'react';
import { newTransaction } from '../service/BlockchainService';
import { checkValidHashAddress } from '../service/Utils';
import { getWallets } from '../service/WalletService';

function TransactionComponent() {
    const [fromAddress, setFromAddress] = useState('');
    const [toAddress, setToAddress] = useState('');
    const [amount, setAmount] = useState('');
    const [senderPrivateKey, setSenderPrivateKey] = useState('');
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const [savedWallets, setSavedWallets] = useState([]);
    const [selectedWalletPublicKey, setSelectedWalletPublicKey] = useState('');

    // Load wallets from localStorage
    useEffect(() => {
        const loadedWallets = getWallets();
        if (loadedWallets && loadedWallets.length > 0) {
            setSavedWallets(loadedWallets);
        }
    }, []);

    const handleWalletSelection = (event) => {
        const publicKey = event.target.value;
        setSelectedWalletPublicKey(publicKey);

        if (publicKey) {
            const selectedWallet = savedWallets.find(
                (wallet) => wallet.walletPublicKey === publicKey
            );
            if (selectedWallet) {
                setFromAddress(selectedWallet.walletPublicKey);
                setSenderPrivateKey(selectedWallet.walletPrivateKey);
                setToAddress('');
                setAmount('');
            }
        } else {
            setFromAddress('');
            setSenderPrivateKey('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

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

            setToAddress('');
            setAmount('');

            // If a wallet was selected, keep it selected but clear other fields
            if (!selectedWalletPublicKey) {
                setFromAddress('');
                setSenderPrivateKey('');
            }

        } catch (err) {
            setError(err.response?.data?.message || err.message || 'An unknown error occurred');
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
        .input-readonly {
          background-color: #f0f0f0;
          color: #777;
        }
      `}</style>
            <div style={styles.frame}>
                <h1>Create Transaction</h1>

                {savedWallets.length > 0 && (
                    <div style={styles.formGroup}>
                        <label htmlFor="selectWallet">Select Wallet:</label>
                        <select
                            id="selectWallet"
                            value={selectedWalletPublicKey}
                            onChange={handleWalletSelection}
                            style={styles.inputField}
                        >
                            <option value="">Enter Manually / Select Wallet</option>
                            {savedWallets.map((wallet) => (
                                <option key={wallet.walletPublicKey} value={wallet.walletPublicKey}>
                                    {wallet.walletName && wallet.walletName !== "walletName" ? wallet.walletName : `${wallet.walletPublicKey.substring(0,10)}...`}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={styles.formGroup}>
                        <label htmlFor="fromAddress">From Address:</label>
                        <input
                            type="text"
                            id="fromAddress"
                            value={fromAddress}
                            onChange={(e) => setFromAddress(e.target.value)}
                            placeholder="Sender address"
                            readOnly={!!selectedWalletPublicKey}
                            className={selectedWalletPublicKey ? 'input-readonly' : ''}
                            style={styles.inputField}
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label htmlFor="privateKey">Private Key:</label>
                        <input
                            type="password"
                            id="privateKey"
                            value={senderPrivateKey}
                            onChange={(e) => setSenderPrivateKey(e.target.value)}
                            placeholder="Your private key"
                            readOnly={!!selectedWalletPublicKey}
                            className={selectedWalletPublicKey ? 'input-readonly' : ''}
                            style={styles.inputField}
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label htmlFor="toAddress">To Address:</label>
                        <input
                            type="text"
                            id="toAddress"
                            value={toAddress}
                            onChange={(e) => setToAddress(e.target.value)}
                            placeholder="Recipient address"
                            style={styles.inputField}
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label htmlFor="amount">Amount:</label>
                        <input
                            type="number"
                            id="amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            step="0.0001"
                            style={styles.inputField}
                        />
                    </div>

                    <button type="submit" disabled={loading} style={styles.button}>
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

                {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}

                {message && (
                    <div style={{marginTop: '15px'}}>
                        <h2>Result</h2>
                        <p>{message}</p>
                    </div>
                )}
            </div>
        </>
    );
}

const styles = {
    frame: {
        border: '2px solid #ccc',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        maxWidth: '500px',
        margin: '20px auto',
        fontFamily: 'Arial, sans-serif',
    },
    formGroup: {
        marginBottom: '15px',
    },
    inputField: {
        width: 'calc(100% - 22px)',
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '16px',
    },
    button: {
        backgroundColor: '#3498db',
        color: 'white',
        padding: '10px 15px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingContainer: {
        display: 'flex',
        alignItems: 'center',
    },
    spinner: {
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #2980b9',
        borderRadius: '50%',
        width: '16px',
        height: '16px',
        animation: 'spin 1s linear infinite',
        marginRight: '8px',
    },
};

export default TransactionComponent;