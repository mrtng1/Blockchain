export class EncryptionService {
    constructor() {
        this.staticKey = null;
    }

    async encryptMessage(message) {
        if (!(this.staticKey instanceof CryptoKey)) {
            throw new Error("Cannot encrypt: staticKey is not a CryptoKey (did you derive it yet?)");
        }

        try {
            const iv      = crypto.getRandomValues(new Uint8Array(12));
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
        if (!(this.staticKey instanceof CryptoKey)) {
            throw new Error("Cannot decrypt: staticKey is not a CryptoKey (did you derive it yet?)");
        }

        try {
            const data = this.base64ToArrayBuffer(encryptedData);
            if (data.length < 12) {
                throw new Error("Invalid encrypted data: too short");
            }

            const iv         = data.slice(0, 12);
            const ciphertext = data.slice(12);

            const decrypted = await window.crypto.subtle.decrypt(
                { name: "AES-GCM", iv },
                this.staticKey,
                ciphertext
            );

            return new TextDecoder().decode(decrypted);
        } catch (error) {
            console.error('Decryption failed for:', encryptedData, error);
            throw error;
        }
    }

    async generateKeyPair() {
        const keyPair = await crypto.subtle.generateKey(
            { name: "ECDH", namedCurve: "P-256" },
            true,
            ["deriveKey","deriveBits"]
        );

        // export and store the private key _bytes_ in PKCS#8 format
        const privBytes = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);
        const privBase64 = this.arrayBufferToBase64(privBytes);
        localStorage.setItem("thisUserPrivateKey", privBase64);

        // export and share the public SPKI key
        const pubBytes  = await crypto.subtle.exportKey("spki", keyPair.publicKey);
        const pubBase64 = this.arrayBufferToBase64(pubBytes);
        localStorage.setItem("thisUserPublicKey", pubBase64);

        return pubBase64;
    }

    async deriveSharedSecret(peerPublicECDHKeyBase64) {

        // pull the Base64 version of peers PKCS#8 string
        const privBase64 = localStorage.getItem("thisUserPrivateKey");
        if (!privBase64) {
            throw new Error("Cannot derive shared secret: ECDH private key is missing.");
        }

        // decode and import currentUsers private key
        const privBuffer = this.base64ToArrayBuffer(privBase64);
        const myPrivateKey = await crypto.subtle.importKey(
            "pkcs8",
            privBuffer,
            { name: "ECDH", namedCurve: "P-256" },
            false,
            ["deriveKey","deriveBits"]
        );

        // decode and import peers public key
        const peerPubBuffer = this.base64ToArrayBuffer(peerPublicECDHKeyBase64.toString());
        const peerPublicKey = await crypto.subtle.importKey(
            "spki",
            peerPubBuffer,
            { name: "ECDH", namedCurve: "P-256" },
            false,
            []
        );

        // derive the shared AES‑GCM key
        this.sharedAesKey = await crypto.subtle.deriveKey(
            { name: "ECDH", public: peerPublicKey },
            myPrivateKey,
            { name: "AES-GCM", length: 256 },
            true,
            ["encrypt","decrypt"]
        );

        // set the shared AES key as the encryption key
        this.staticKey = this.sharedAesKey;
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

    base64ToArrayBuffer(input) {
        // input check
        if (typeof input !== "string") {
            console.error("base64ToArrayBuffer got non‑string:", input);
            throw new TypeError("base64ToArrayBuffer: expected a string");
        }

        // normalize URL‑safe
        let b64 = input;
        if (b64.includes("-") || b64.includes("_")) {
            b64 = b64.replace(/-/g, "+").replace(/_/g, "/");
        }

        // pad to multiple of 4
        const padLen = (4 - (b64.length % 4)) % 4;
        if (padLen) {
            b64 += "=".repeat(padLen);
        }

        // decode
        let binary;
        try {
            binary = atob(b64);
        } catch (err) {
            console.error("Invalid Base64 string:", b64);
            throw err;
        }

        // to Uint8Array
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
    }
}