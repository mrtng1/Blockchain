import React, { useState } from 'react';
import { createWallet } from '../service/WalletService';

function CreateWalletComponent() {
    const [wallet, setWallet] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleCreateWallet = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setWallet(null);

        try {
            const result = await createWallet();
            setWallet(result);
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
                <h1>Create Wallet</h1>
                <form onSubmit={handleCreateWallet}>
                    <button type="submit" disabled={loading}>
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

                {error && <p style={{ color: 'red' }}>{error}</p>}

                {wallet && (
                    <div>
                        <h2>Wallet</h2>
                        <p style={styles.hash}><strong>Address:</strong> {wallet.address}</p>
                        <p><strong>Private Key:</strong></p>
                        <pre style={styles.block}>{wallet.privateKey}</pre>
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
        width: '400px',
        margin: '20px auto',
    },
    block: {
        backgroundColor: '#f7f7f7',
        padding: '10px',
        borderRadius: '4px',
        overflowX: 'auto',
        wordBreak: 'break-all',
        color: 'black',
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
    hash: {
        wordBreak: 'break-all',
        color: 'white',
        whiteSpace: 'pre-wrap',
    },
};

export default CreateWalletComponent;
