/**
 * Checks if the given wallet address is a valid hash address.
 *
 * @param {string} address The wallet address to validate.
 * @returns {boolean} Returns true if the address is valid, false otherwise.
 */
export function checkValidHashAddress(address) {
    const base64Regex = /^[A-Za-z0-9+/=]+$/;

    if (!base64Regex.test(address)) {
        return false;
    }

    try {
        const decoded = atob(address);
        if (decoded.length < 32 || decoded.length > 256) {
            return false;
        }
    } catch (e) {
        return false;
    }

    return true;
}