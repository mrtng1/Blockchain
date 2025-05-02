import { API_URL } from '../environment';

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
