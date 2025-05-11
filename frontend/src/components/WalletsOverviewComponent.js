import React, { useState, useEffect } from 'react';
import { getWallets } from '../service/WalletService';

function WalletOverviewComponent() {
    const [wallets, setWallets] = useState([]);
    const [error, setError] = useState(null);
    const [visiblePrivateKeys, setVisiblePrivateKeys] = useState({});

    useEffect(() => {
        try {
            const storedWallets = getWallets();
            setWallets(storedWallets);

            const initialVisibilityState = {};
            if (storedWallets && storedWallets.length > 0) {
                storedWallets.forEach(wallet => {
                    if (wallet.walletPublicKey) {
                        initialVisibilityState[wallet.walletPublicKey] = false;
                    }
                });
            }
            setVisiblePrivateKeys(initialVisibilityState);
        } catch (err) {
            console.error("Error loading wallets", err);
            setError("Failed to load wallets..");
        }
    }, []);

    const togglePrivateKeyVisibility = (publicKey) => {
        setVisiblePrivateKeys(prevState => ({
            ...prevState,
            [publicKey]: !prevState[publicKey]
        }));
    };

    return (
        <div style={styles.frame}>
            <h1 style={styles.header}>Wallet Overview</h1>

            {error && <p style={{ color: 'red', ...styles.text }}>{error}</p>}

            {wallets.length === 0 && !error && (
                <p style={styles.text}>No wallets found. You can create or recover a wallet.</p>
            )}

            {wallets.map((wallet, index) => (
                <div key={wallet.walletPublicKey || `wallet-${index}`} style={styles.walletItem}>
                    <div style={styles.walletDetailRow}>
                        <strong style={styles.text}>Name:</strong> <span style={styles.text}>{wallet.walletName || 'N/A'}</span>
                    </div>
                    <div style={styles.walletDetailRow}>
                        <strong style={styles.text}>Public Key:</strong> <span style={styles.text}>{wallet.walletPublicKey || 'N/A'}</span>
                    </div>
                    <div style={styles.walletDetailRow}>
                        <strong style={styles.text}>Private Key:</strong>
                        <span style={styles.privateKeyText}>
                            {wallet.walletPublicKey && visiblePrivateKeys[wallet.walletPublicKey]
                                ? wallet.walletPrivateKey
                                : '••••••••••••••••••••••••••••••••••••••••••••••••••••••••'}
                        </span>
                        {wallet.walletPublicKey && wallet.walletPrivateKey && (
                            <button
                                onClick={() => togglePrivateKeyVisibility(wallet.walletPublicKey)}
                                style={styles.toggleButton}
                                aria-label={visiblePrivateKeys[wallet.walletPublicKey] ? 'Hide' : 'Show'}
                            >
                                {visiblePrivateKeys[wallet.walletPublicKey] ? 'Hide' : 'Show'}
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

const styles = {
    frame: {
        border: '2px solid #ccc',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        maxWidth: '700px',
        margin: '20px auto',
        fontFamily: 'Arial, sans-serif',
        color: '#000000',
    },
    header: {
        color: 'white',
    },
    text: {
        color: '#000000',
    },
    walletItem: {
        border: '1px solid #eee',
        padding: '15px',
        marginBottom: '15px',
        borderRadius: '6px',
        backgroundColor: '#f9f9f9',
    },
    walletDetailRow: {
        marginBottom: '8px',
        wordBreak: 'break-all',
        color: '#000000',
    },
    privateKeyText: {
        marginRight: '10px',
        fontFamily: 'monospace',
        color: '#000000',
    },
    toggleButton: {
        padding: '5px 10px',
        marginLeft: '5px',
        cursor: 'pointer',
        border: '1px solid #ddd',
        borderRadius: '4px',
        backgroundColor: '#e7e7e7',
        fontSize: '0.9em',
        color: '#000000',
    }
};

export default WalletOverviewComponent;