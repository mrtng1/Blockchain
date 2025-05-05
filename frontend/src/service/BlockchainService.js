import { API_URL } from '../environment';

/**
 * Sends a POST request to mine pending transactions for a given miner address.
 *
 * @param {string} minerAddress
 * @returns {Promise<{ message: string, latestBlock: object }>}  Resolves to an object containing the result message and the latest block.
 * @throws {Error} if the network request fails or returns non-OK.
 */
export async function minePending(minerAddress) {
    const url = `${API_URL}/api/Blockchain/mine/${encodeURIComponent(minerAddress)}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Error mining block: ${response.status} ${text}`);
    }

    const data = await response.json();
    return data;
}
