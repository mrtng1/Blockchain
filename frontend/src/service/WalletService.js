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
export async function createWallet() {
    const url = `${API_URL}/api/Wallets`;
    const token = await authService.getToken();

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            //'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Error creating wallet: ${response.status} ${text}`);
    }

    // Extract the wallet data from the response
    const walletData = await response.json();

    // Retrieve the wallet address from the response
    const walletAddress = walletData.address;

    // Assuming you have the user's ID (maybe from the Keycloak token or user session)
    const userId = authService.getUserId(); // Replace this with how you get the user ID

    // Save the wallet address to Keycloak
    await saveWallet(userId, walletAddress, token);

    return walletData;
}


/**
 * Saves the wallet address to the user's attributes in Keycloak.
 *
 * @param {string} userId The Keycloak user ID to update.
 * @param {string} walletAddress The wallet address to store.
 * @param {string} token The Auth Token.
 * @returns {Promise<void>} Resolves when the wallet address is saved.
 * @throws {Error} if the network request fails or returns non-OK.
 */
async function saveWallet(userId, walletAddress, token) {
    //const token = authService.getToken(); // Assuming you have a token service to fetch the token
    const url = `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/users/${userId}`;

    const headers = {
        //'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };

    const body = JSON.stringify({
        attributes: {
            walletAddress: walletAddress,
        },
    });

    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: headers,
            body: body,
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Error saving wallet address: ${response.status} ${text}`);
        }

        console.log('Wallet address saved successfully');
    } catch (error) {
        console.error(`Error: ${error.message}`);
        throw error;
    }
}
