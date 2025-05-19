import {HubConnectionBuilder, LogLevel, HttpTransportType } from "@microsoft/signalr";
import { API_URL } from "../environment";
import { EncryptionService } from "./EncryptionService";

export class ChatService {
    constructor() {
        // User Data
        this.userId = null;
        this.peerUsername = null;

        // Message Handlers
        this.handlers = [];
        this.keyExchangeCompleteHandlers = [];
        this.connection = null;
        this.encryption = new EncryptionService();

        // Exchange status flags
        this.hasSentKey = false;
        this.hasReceivedKey = false;

        // Public keys
        this.myPublicKey = null;
        this.otherPublicKey = null;
    }

    onKeyExchangeComplete(handler) {
        this.keyExchangeCompleteHandlers.push(handler);
        if (this.areKeysExchanged()) {
            handler();
        }
        return () => {
            this.keyExchangeCompleteHandlers = this.keyExchangeCompleteHandlers.filter(h => h !== handler);
        };
    }

    areKeysExchanged() {
        return this.hasSentKey && this.hasReceivedKey && !!this.myPublicKey && !!this.otherPublicKey;
    }

    checkAndNotifyKeyExchangeCompletion() {
        if (this.areKeysExchanged()) {
            this.keyExchangeCompleteHandlers.forEach(h => h());
        }
    }

    async start(userId, peerUsername) {
        try {
            //await this.encryption.initialize();
            this.userId = userId;

            if (!localStorage.getItem("thisUserPublicKey") || !localStorage.getItem("thisUserPrivateKey")) {
                await this.encryption.generateKeyPair();
            }
            this.myPublicKey = localStorage.getItem("thisUserPublicKey");

            //await this.encryption.generateKeyPair();

            this.connection = new HubConnectionBuilder()
                .withUrl(`${API_URL}/hubs/chat?username=${encodeURIComponent(userId)}`, {
                    transport: HttpTransportType.WebSockets,
                    skipNegotiation: true
                })
                .configureLogging(LogLevel.Information)
                .build();

            this.connection.on("ReceiveEncryptedMessage", async (msg) => {
                try {
                    if (!this.areKeysExchanged()) {
                        console.warn("Received message before key exchange complete. Message might be unreadable or for old session.");
                    }
                    const decrypted = await this.encryption.decryptMessage(msg.content);
                    this.handlers.forEach(h => h({ ...msg, content: decrypted }));
                } catch (error) {
                    console.error("Decryption failed:", error.message, "Raw content:", msg.content);
                }
            });

            this.connection.on("RetrieveExchangedKey", async (otherUserPublicKey) => {
                let needsToSendOurKey = false;
                let isFirstTimeReceipt = false;

                if (!this.otherPublicKey) {
                    this.otherPublicKey = otherUserPublicKey;
                    this.hasReceivedKey = true;
                    needsToSendOurKey = true;
                    isFirstTimeReceipt = true;
                } else if (this.otherPublicKey === otherUserPublicKey) {
                    console.log("Received the same public key again from peer. Current otherPublicKey:", this.otherPublicKey);
                    if (!this.areKeysExchanged()) {
                        needsToSendOurKey = true;
                    }
                }

                if (needsToSendOurKey && this.connection.state === "Connected" && this.myPublicKey) {
                    try {
                        await this.connection.invoke("ExchangePublicKeys", {
                            SenderUsername: this.userId,
                            SenderPublicKey: this.myPublicKey,
                            RecipientUsername: peerUsername
                        });
                        this.hasSentKey = true;
                    } catch (e) {
                        console.error(`Error sending/re-sending public key to ${peerUsername} in RetrieveExchangedKey:`, e);
                    }
                }


                // Public Key Exchange Complete
                this.checkAndNotifyKeyExchangeCompletion();

                // Construct and set a new SharedSecret from peers public key
                await this.encryption.deriveSharedSecret(this.otherPublicKey.publicKey);
            });

            await this.connection.start();

            if (this.connection.state === "Connected" && this.myPublicKey && !this.hasSentKey) {
                try {
                    await this.connection.invoke("ExchangePublicKeys", {
                        SenderUsername: this.userId,
                        SenderPublicKey: this.myPublicKey,
                        RecipientUsername: peerUsername
                    });
                    this.hasSentKey = true;
                    this.checkAndNotifyKeyExchangeCompletion();
                } catch (e) {
                    console.error("Error sending initial public key:", e);
                    throw new Error(`Failed to send initial public key: ${e.message}`);
                }
            } else if (this.connection.state === "Connected" && !this.myPublicKey) {
                console.error("Cannot send public key: My public key is not generated.");
                throw new Error("Public key generation failed or not available when needed.");
            } else if (this.hasSentKey) {
                console.log("My public key was already marked as sent.");
                this.checkAndNotifyKeyExchangeCompletion();
            }

        } catch (error) {
            console.error("ChatService start failed:", error);
            throw error;
        }
    }

    stop() {
        this.hasSentKey = false;
        this.hasReceivedKey = false;
        this.myPublicKey = null;
        this.otherPublicKey = null;
        return this.connection ? this.connection.stop() : Promise.resolve();
    }

    onMessage(handler) {
        this.handlers.push(handler);
        return () => {
            this.handlers = this.handlers.filter((h) => h !== handler);
        };
    }

    async sendPrivateMessage({ Recipient, Content }) {
        if (!this.areKeysExchanged()) {
            console.error("Attempted to send message before keys were exchanged!");
            throw new Error("Key exchange not complete. Cannot send message.");
        }
        try {
            const encrypted = await this.encryption.encryptMessage(Content);
            console.log('Sending encrypted message to:', Recipient);

            return this.connection.invoke("SendPrivateMessage", {
                Sender: this.userId,
                Recipient,
                Content: encrypted
            });
        } catch (error) {
            console.error("Send failed:", error);
            throw error;
        }
    }
}