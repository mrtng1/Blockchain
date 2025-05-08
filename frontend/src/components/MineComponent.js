import React, { useState, useEffect } from 'react';
import { minePending, getPendingTransactions } from '../service/BlockchainService';
import { checkValidHashAddress } from '../service/Utils';

function MineComponent() {
    const [minerAddress, setMinerAddress] = useState('');
    const [message, setMessage] = useState(null);
    const [latestBlock, setLatestBlock] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [pendingTransactions, setPendingTransactions] = useState([]);

    useEffect(() => {
        const fetchPending = async () => {
            try {
                const txs = await getPendingTransactions();
                setPendingTransactions(txs);
            } catch (err) {
                console.error('Failed to fetch pending transactions:', err);
            }
        };

        fetchPending();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!minerAddress) {
            setError('Please enter a miner address.');
            return;
        }

        const isValid = checkValidHashAddress(minerAddress);
        if (!isValid) {
            setError('Invalid miner address.');
            return;
        }

        setLoading(true);
        setError(null);
        setMessage(null);
        setLatestBlock(null);

        try {
            const result = await minePending(minerAddress);
            setMessage(result.message);
            setLatestBlock(result.latestBlock);
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
                <h1>Mine Pending Transactions</h1>

                <div style={styles.pendingCount}>
                    <small>Pending transactions: {pendingTransactions.length}</small>
                </div>

                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="minerAddress">Miner Address:</label>
                        <input
                            type="text"
                            id="minerAddress"
                            value={minerAddress}
                            onChange={(e) => setMinerAddress(e.target.value)}
                            placeholder="Enter miner address"
                        />
                    </div>
                    <button type="submit" disabled={loading}>
                        {loading ? (
                            <div style={styles.loadingContainer}>
                                <div style={styles.spinner}></div>
                                <span>Mining block...</span>
                            </div>
                        ) : (
                            'Mine'
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

                {latestBlock && (
                    <div>
                        <h2>Latest Block</h2>
                        <pre style={styles.block}>
              {JSON.stringify(latestBlock, null, 2)}
            </pre>
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
    pendingCount: {
        fontSize: '0.8rem',
        color: '#666',
        marginBottom: '10px',
    }
};

export default MineComponent;
