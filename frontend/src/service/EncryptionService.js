// src/service/EncryptionService.js
export class EncryptionService {
    constructor() {
        this.staticKey = null;
        // Temporal test key
        this.testKeyBase64 = 'pa0DQILgX5_wALTEgYG2kREsAm_a21H8Sv4TpcfZweo';
    }

    async initialize() {
        try {
            const keyData = this.base64ToArrayBuffer(this.testKeyBase64);

            if (keyData.byteLength !== 32) {
                throw new Error(`Invalid key length: ${keyData.byteLength} bytes`);
            }

            this.staticKey = await window.crypto.subtle.importKey(
                "raw",
                keyData,
                { name: "AES-GCM", length: 256 },
                true,
                ["encrypt", "decrypt"]
            );
        } catch (error) {
            console.error('Key initialization failed:', error);
            throw error;
        }
    }

    async encryptMessage(message) {
        try {
            const iv = crypto.getRandomValues(new Uint8Array(12));
            const encoded = new TextEncoder().encode(message);

            const ciphertext = await window.crypto.subtle.encrypt(
                { name: "AES-GCM", iv },
                this.staticKey,
                encoded
            );

            const combined = new Uint8Array([...iv, ...new Uint8Array(ciphertext)]);
            return this.arrayBufferToBase64(combined);
        } catch (error) {
            console.error('Encryption failed:', error);
            throw error;
        }
    }

    async decryptMessage(encryptedData) {
        try {
            const data = this.base64ToArrayBuffer(encryptedData);
            if (data.length < 12) throw new Error("Invalid encrypted data");

            const iv = data.slice(0, 12);
            const ciphertext = data.slice(12);

            const decrypted = await window.crypto.subtle.decrypt(
                { name: "AES-GCM", iv },
                this.staticKey,
                ciphertext
            );

            return new TextDecoder().decode(decrypted);
        } catch (error) {
            console.error('Decryption failed for:', encryptedData);
            throw error;
        }
    }

    // Robust Base64 handling with URL-safe support
    arrayBufferToBase64(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary)
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    }

    base64ToArrayBuffer(base64) {
        // Convert URL-safe base64 to standard base64
        const standardBase64 = base64
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const padding = standardBase64.length % 4;
        const paddedBase64 = padding
            ? standardBase64 + '='.repeat(4 - padding)
            : standardBase64;

        const binaryString = atob(paddedBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    }
}