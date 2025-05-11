import React, { useState } from 'react';
import { recoverWallet } from '../service/WalletService';

function RecoverWalletComponent() {
    const [mnemonicWords, setMnemonicWords] = useState(Array(12).fill(''));
    const [wallet, setWallet] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleInputChange = (index, value) => {
        const newWords = [...mnemonicWords];
        newWords[index] = value.trim();
        setMnemonicWords(newWords);
    };

    const handleRecover = async () => {
        setLoading(true);
        setError(null);
        setWallet(null);

        try {
            const trimmedWords = mnemonicWords.map(w => w.trim()).filter(Boolean);
            if (trimmedWords.length !== 12) {
                throw new Error("Please enter exactly 12 words.");
            }

            const mnemonic = trimmedWords.join(" ");
            const recovered = await recoverWallet(mnemonic);
            setWallet(recovered);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };



    return (
        <div style={styles.frame}>
            <h1>Recover Wallet</h1>
            <form onSubmit={handleRecover}>
                <div style={styles.grid}>
                    {mnemonicWords.map((word, i) => (
                        <input
                            key={i}
                            type="text"
                            value={word}
                            onChange={(e) => handleInputChange(i, e.target.value)}
                            placeholder={`${i + 1}`}
                            style={styles.input}
                        />
                    ))}
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Recovering...' : 'Recover Wallet'}
                </button>
            </form>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            {wallet && (
                <div>
                    <h2>Recovered Wallet</h2>
                    <p><strong>Address:</strong> <span style={styles.hash}>{wallet.address}</span></p>
                    <p><strong>Private Key:</strong></p>
                    <pre style={styles.block}>{wallet.privateKey}</pre>
                </div>
            )}
        </div>
    );
}

const styles = {
    frame: {
        border: '2px solid #ccc',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        width: '720px', // wider container
        margin: '20px auto',
        boxSizing: 'border-box',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '10px',
        marginBottom: '15px',
    },
    input: {
        padding: '4px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        fontSize: '13px',
        textAlign: 'center',
        minWidth: '0',
    },
    block: {
        backgroundColor: '#f7f7f7',
        padding: '10px',
        borderRadius: '4px',
        overflowX: 'auto',
        wordBreak: 'break-all',
        color: 'black',
    },
    hash: {
        wordBreak: 'break-word',
        whiteSpace: 'pre-wrap',
    },
};

export default RecoverWalletComponent;
