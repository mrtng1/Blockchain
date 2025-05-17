import { API_URL, KEYCLOAK_URL, KEYCLOAK_CLIENT, KEYCLOAK_REALM } from '../environment';
import authService from "./AuthService";

/**
 * Fetches the token balance for a given wallet address.
 *
 * @param {string} address  Ethereum-style address (e.g. "0x123...")
 * @returns {Promise<BalanceDto>}  Resolves to { address, balance }
 * @throws {Error} if the network request fails or returns non-OK.
 */
export async function getWalletBalance(address) {
    const url = `${API_URL}/api/wallets/${encodeURIComponent(address)}/balance`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        },
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Error fetching balance: ${response.status} ${text}`);
    }

    const data = await response.json();
    return data;
}

/**
 * Sends a POST request to create a new wallet.
 *
 * @returns {Promise<{ address: string, privateKey: string }>} Resolves to the new wallet DTO.
 * @throws {Error} if the network request fails or returns non-OK.
 */
export async function createWallet(walletName) {
    const url = `${API_URL}/api/Wallets`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Error creating wallet: ${response.status} ${text}`);
    }

    // Extract the wallet data from the response
    const walletData = await response.json();

    // Retrieve the wallet address from the response
    const walletPublicKey = walletData.address;
    const walletPrivateKey = walletData.privateKey;

    await saveWallet(walletName, walletPublicKey, walletPrivateKey);

    return walletData;
}


/**
 * Adds a wallet to the list stored in localStorage, only if it's not already there.
 *
 * @param {string} walletName Name of the wallet.
 * @param {string} walletPublicKey The public key of the wallet.
 * @param {string} walletPrivateKey The private key of the wallet.
 */
export function saveWallet(walletName, walletPublicKey, walletPrivateKey) {
    try {
        const existing = JSON.parse(localStorage.getItem('wallets')) || [];

        const alreadyExists = existing.some(
            (w) => w.walletPublicKey === walletPublicKey
        );

        if (alreadyExists) {
            console.warn(`Wallet with public key ${walletPublicKey} already exists. Skipping save.`);
            return;
        }

        const newWallet = {
            walletName,
            walletPublicKey,
            walletPrivateKey,
        };

        existing.push(newWallet);
        localStorage.setItem('wallets', JSON.stringify(existing));

        console.log('Wallet added successfully');
    } catch (error) {
        console.error(`Error saving wallet: ${error.message}`);
        throw error;
    }
}


/**
 * Retrieves the list of wallets from localStorage.
 *
 * @returns {Array} Array of wallet objects.
 */
export function getWallets() {
    try {
        return JSON.parse(localStorage.getItem('wallets')) || [];
    } catch (error) {
        console.error(`Error retrieving wallets: ${error.message}`);
        return [];
    }
}

/**
 * Recovers a wallet using a mnemonic phrase.
 *
 * @param {string} walletName Name to store the recovered wallet under.
 * @param {string} mnemonic The 12-word (or more) mnemonic phrase.
 * @returns {Promise<{ address: string, privateKey: string, mnemonic: string }>} Resolves to the recovered wallet DTO.
 * @throws {Error} if the recovery fails or backend returns an error.
 */
export async function recoverWallet( mnemonic) {
    const url = `${API_URL}/api/wallets/recover`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mnemonic }),
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Error recovering wallet: ${response.status} ${text}`);
    }

    const walletData = await response.json();

    // Save to localStorage
    saveWallet("recoveredWallet", walletData.address, walletData.privateKey);

    return walletData;
}
