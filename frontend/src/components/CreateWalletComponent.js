import React, { useState, useEffect } from 'react';
import { createWallet } from '../service/WalletService';

function CreateWalletComponent() {
    const [walletName, setWalletName] = useState('');
    const [wallet, setWallet] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showMnemonicModal, setShowMnemonicModal] = useState(false);

    useEffect(() => {
        if (showMnemonicModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showMnemonicModal]);

    const handleCreateWallet = async (e) => {
        e.preventDefault();
        if (!walletName.trim()) {
            setError('Please enter a wallet name.');
            return;
        }
        setLoading(true);
        setError(null);
        setWallet(null);
        setShowMnemonicModal(false);

        try {
            const result = await createWallet(walletName);
            setWallet(result);
            if (result && result.mnemonic) {
                setShowMnemonicModal(true);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCloseMnemonicModal = () => {
        setShowMnemonicModal(false);
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
                <h1>Create Wallet</h1>
                <form onSubmit={handleCreateWallet}>
                    <div style={styles.inputGroup}>
                        <label htmlFor="walletName" style={styles.label}>Wallet Name:</label>
                        <input
                            type="text"
                            id="walletName"
                            value={walletName}
                            onChange={(e) => setWalletName(e.target.value)}
                            placeholder="Enter wallet name"
                            style={styles.input}
                            required
                        />
                    </div>
                    <button type="submit" disabled={loading} style={styles.button}>
                        {loading ? (
                            <div style={styles.loadingContainer}>
                                <div style={styles.spinner}></div>
                                <span>Creating wallet...</span>
                            </div>
                        ) : (
                            'Create Wallet'
                        )}
                    </button>
                </form>

                {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}

                {/* Wallet address can be shown here if needed after modal is closed */}
                {wallet && !showMnemonicModal && wallet.address && (
                    <div style={styles.walletInfo}>
                        <h2>Wallet Ready</h2>
                        <p style={{marginTop: '5px', fontSize: '0.9em', color: 'white'}}>Your mnemonic was shown. Ensure it's saved securely.</p>
                    </div>
                )}
            </div>

            {showMnemonicModal && wallet && wallet.mnemonic && (
                <div style={styles.modalOverlay} onClick={handleCloseMnemonicModal}>
                    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <h2 style={styles.modalHeader}>Your Mnemonic Phrase</h2>
                        <p style={styles.modalInstructions}>
                            Save this phrase securely. It is the ONLY way to recover your wallet.
                            Do not share it with anyone.
                        </p>
                        <pre style={styles.mnemonicDisplay}>{wallet.mnemonic}</pre>
                        <button onClick={handleCloseMnemonicModal} style={styles.modalButton}>
                            I Have Saved My Mnemonic Phrase
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

const styles = {
    frame: {
        border: '2px solid #ccc',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        width: '400px',
        margin: '20px auto',
        fontFamily: 'Arial, sans-serif',
        position: 'relative',
    },
    inputGroup: {
        marginBottom: '15px',
    },
    label: {
        display: 'block',
        marginBottom: '5px',
        color: '#333',
        fontSize: '0.9em',
    },
    input: {
        width: '100%',
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        boxSizing: 'border-box',
        fontSize: '1em',
    },
    button: {
        width: '100%',
        padding: '10px',
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '1em',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '10px',
    },
    loadingContainer: {
        display: 'flex',
        alignItems: 'center',
    },
    spinner: {
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #ffffff',
        borderRadius: '50%',
        width: '16px',
        height: '16px',
        animation: 'spin 1s linear infinite',
        marginRight: '8px',
    },
    walletInfo: {
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#3498db',
        border: '1px solid #b3d7ff',
        borderRadius: '4px',
    },
    hash: {
        wordBreak: 'break-all',
        color: '#004085',
        whiteSpace: 'pre-wrap',
        fontFamily: 'monospace',
        fontSize: '0.9em',
        backgroundColor: '#cfe8ff',
        padding: '8px',
        borderRadius: '4px',
        marginBottom: '10px',
    },
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center',
    },
    modalHeader: {
        marginTop: 0,
        marginBottom: '15px',
        color: '#333',
    },
    modalInstructions: {
        marginBottom: '20px',
        fontSize: '0.95em',
        color: '#555',
        lineHeight: 1.5,
    },
    mnemonicDisplay: {
        backgroundColor: '#f7f7f7',
        padding: '15px',
        borderRadius: '4px',
        overflowX: 'auto',
        wordBreak: 'break-word',
        whiteSpace: 'pre-wrap',
        color: 'black',
        fontFamily: 'monospace',
        fontSize: '1.1em',
        textAlign: 'left',
        border: '1px solid #eee',
        marginBottom: '25px',
        lineHeight: 1.6,
    },
    modalButton: {
        padding: '12px 25px',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '1em',
        width: '100%',
    }
};

export default CreateWalletComponent;