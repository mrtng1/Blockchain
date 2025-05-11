import React, { useState, useEffect } from 'react';
import { getWallets } from '../service/WalletService';

function WalletOverviewComponent() {
    const [wallets, setWallets] = useState([]);
    const [error, setError] = useState(null);
    const [visiblePrivateKeys, setVisiblePrivateKeys] = useState({});
    const [copyFeedback, setCopyFeedback] = useState('');

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
            setError("Failed to load wallets.");
        }
    }, []);

    const togglePrivateKeyVisibility = (publicKey) => {
        setVisiblePrivateKeys(prevState => ({
            ...prevState,
            [publicKey]: !prevState[publicKey]
        }));
    };

    const handleCopyToClipboard = async (textToCopy, keyType) => {
        if (!textToCopy || textToCopy.startsWith('•')) {
            return;
        }
        try {
            await navigator.clipboard.writeText(textToCopy);
            setCopyFeedback(`${keyType} copied to clipboard!`);
            setTimeout(() => setCopyFeedback(''), 2000);
        } catch (err) {
            setCopyFeedback(`Failed to copy ${keyType}.`);
            setTimeout(() => setCopyFeedback(''), 2000);
        }
    };

    return (
        <div style={styles.frame}>
            <h1 style={styles.header}>Wallet Overview</h1>

            {error && <p style={{ color: 'red', ...styles.text, ...styles.staticMessage }}>{error}</p>}
            {copyFeedback && <p style={{...styles.feedbackText, ...styles.staticMessage}}>{copyFeedback}</p>}

            <div style={styles.walletListContainer}>
                {wallets.length === 0 && !error && (
                    <p style={styles.text}>No wallets found. You can create or recover a wallet.</p>
                )}
                {wallets.map((wallet, index) => (
                    <div key={wallet.walletPublicKey || `wallet-${index}`} style={styles.walletItem}>
                        <div style={styles.keyEntry}>
                            <span style={styles.keyLabel}>Name:</span>
                            <span style={styles.keyValue}>{wallet.walletName || 'N/A'}</span>
                        </div>

                        <div style={styles.keyEntry}>
                            <span style={styles.keyLabel}>Public Key:</span>
                            <span
                                style={{
                                    ...styles.keyValue,
                                    ...(wallet.walletPublicKey && wallet.walletPublicKey !== 'N/A' ? styles.copyable : {})
                                }}
                                onClick={() => {
                                    if (wallet.walletPublicKey && wallet.walletPublicKey !== 'N/A') {
                                        handleCopyToClipboard(wallet.walletPublicKey, 'Public Key');
                                    }
                                }}
                                title={(wallet.walletPublicKey && wallet.walletPublicKey !== 'N/A') ? 'Copy Public Key' : ''}
                            >
                                {wallet.walletPublicKey || 'N/A'}
                            </span>
                        </div>

                        <div style={styles.keyEntry}>
                            <span style={styles.keyLabel}>Private Key:</span>
                            <div style={styles.privateKeyContainer}>
                                <span style={styles.privateKeyValueDisplay}>
                                    {wallet.walletPublicKey && visiblePrivateKeys[wallet.walletPublicKey] ? (
                                        <span
                                            style={styles.copyable}
                                            onClick={() => handleCopyToClipboard(wallet.walletPrivateKey, 'Private Key')}
                                            title="Copy Private Key"
                                        >
                                            {wallet.walletPrivateKey}
                                        </span>
                                    ) : (
                                        '••••••••••••••••••••••••••••••••••••••••••••••••••••••••'
                                    )}
                                </span>
                                {wallet.walletPublicKey && wallet.walletPrivateKey && (
                                    <button
                                        onClick={() => togglePrivateKeyVisibility(wallet.walletPublicKey)}
                                        style={styles.toggleButton}
                                        aria-label={visiblePrivateKeys[wallet.walletPublicKey] ? 'Hide private key' : 'Show private key'}
                                    >
                                        {visiblePrivateKeys[wallet.walletPublicKey] ? 'Hide' : 'Show'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
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
        height: '600px',
        margin: '20px auto',
        fontFamily: 'Arial, sans-serif',
        color: '#000000',
        display: 'flex',
        flexDirection: 'column',
    },
    header: {
        color: 'white',
        textAlign: 'center',
        marginBottom: '15px',
        flexShrink: 0,
    },
    staticMessage: {
        flexShrink: 0,
        textAlign: 'center',
    },
    text: {
        color: '#000000',
    },
    feedbackText: {
        color: 'green',
        minHeight: '1.2em',
        fontWeight: 'bold',
        marginBottom: '10px',
    },
    walletListContainer: {
        flexGrow: 1,
        overflowY: 'auto',
        minHeight: 0,
        paddingRight: '10px',
        paddingLeft: '5px',
    },
    walletItem: {
        border: '1px solid #eee',
        padding: '15px',
        marginBottom: '15px',
        borderRadius: '6px',
        backgroundColor: '#f9f9f9',
    },
    keyEntry: {
        marginBottom: '12px',
    },
    keyLabel: {
        fontWeight: 'bold',
        color: '#000000',
        display: 'block',
        marginBottom: '4px',
    },
    keyValue: {
        color: '#000000',
        wordBreak: 'break-all',
        fontFamily: 'monospace',
        display: 'block',
    },
    copyable: {
        cursor: 'pointer',
    },
    privateKeyContainer: {
        display: 'flex',
        alignItems: 'center',
    },
    privateKeyValueDisplay: {
        flexGrow: 1,
        wordBreak: 'break-all',
        fontFamily: 'monospace',
        color: '#000000',
        marginRight: '10px',
    },
    toggleButton: {
        padding: '5px 10px',
        cursor: 'pointer',
        border: '1px solid #ddd',
        borderRadius: '4px',
        backgroundColor: '#e7e7e7',
        fontSize: '0.9em',
        color: '#000000',
        flexShrink: 0,
    }
};

export default WalletOverviewComponent;