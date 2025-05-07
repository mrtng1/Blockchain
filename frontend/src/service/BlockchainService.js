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


/**
 * Creates a new transaction and adds it to the mempool.
 *
 * @param {string} fromAddress
 * @param {string} toAddress
 * @param {number} amount
 * @param {string} senderPrivateKey
 * @returns {Promise<{ message: string }>} Resolves to an object containing the result message
 * @throws {Error} if the network request fails or returns non-OK
 */
export async function newTransaction(fromAddress, toAddress, amount, senderPrivateKey) {
    const url = `${API_URL}/api/Blockchain/transaction`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            FromAddress: fromAddress,
            ToAddress: toAddress,
            Amount: amount,
            SenderPrivateKey: senderPrivateKey
        })
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Error creating transaction: ${response.status} ${text}`);
    }

    const data = await response.json();
    return data;
}