import {HubConnectionBuilder, LogLevel, HttpTransportType } from "@microsoft/signalr";
import { API_URL } from "../environment";
import { EncryptionService } from "./EncryptionService";

export class ChatService {
    constructor() {
        this.handlers = [];
        this.connection = null;
        this.encryption = new EncryptionService();
    }

    async start(userId) {
        try {
            await this.encryption.initialize();
            this.userId = userId;

            if (this.connection) {
                await this.connection.stop();
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            this.connection = new HubConnectionBuilder()
                .withUrl(`${API_URL}/hubs/chat?username=${encodeURIComponent(userId)}`, {
                    transport: HttpTransportType.WebSockets,
                    skipNegotiation: true
                })
                .configureLogging(LogLevel.Warning)
                .build();

            this.connection.on("ReceiveEncryptedMessage", async (msg) => {
                try {
                    const decrypted = await this.encryption.decryptMessage(msg.content);
                    this.handlers.forEach(h => h({
                        ...msg,
                        content: decrypted
                    }));
                } catch (error) {
                    console.error('Decryption failed for message:', {
                        content: msg.content,
                        error: error.message
                    });
                }
            });

            await this.connection.start();
        } catch (error) {
            console.error("Connection failed:", error);
            throw error;
        }
    }

    stop() {
        return this.connection ? this.connection.stop() : Promise.resolve();
    }

    onMessage(handler) {
        this.handlers.push(handler);
        return () => {
            this.handlers = this.handlers.filter((h) => h !== handler);
        };
    }

    async sendPrivateMessage({ Recipient, Content }) {
        try {
            const encrypted = await this.encryption.encryptMessage(Content);
            console.log('Sending encrypted:', encrypted);

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