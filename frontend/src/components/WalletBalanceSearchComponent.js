import React, { useState } from 'react';
import { getWalletBalance } from '../service/WalletService';
import { checkValidHashAddress } from '../service/Utils';

function WalletBalanceSearchComponent() {
    const [address, setAddress] = useState('');
    const [balance, setBalance] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!address) {
            setError('Please enter a wallet address.');
            return;
        }

        const isValid = checkValidHashAddress(address);
        if(!isValid){
            setError('Invalid address.');
            return;
        }

        setLoading(true);
        setError(null);
        setBalance(null);

        try {
            const result = await getWalletBalance(address);
            setBalance(result.balance);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.frame}>
            <h1>Check Wallet Balance</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="address">Wallet Address:</label>
                    <input
                        type="text"
                        id="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Enter wallet address"
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Loading...' : 'Check Balance'}
                </button>
            </form>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            {balance !== null && (
                <div>
                    <h2>Balance</h2>
                    <p>{balance}</p>
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
        width: '300px',
        margin: '20px auto',
    }
};

export default WalletBalanceSearchComponent;
