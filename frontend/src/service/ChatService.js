// src/services/ChatService.js
import {HubConnectionBuilder, LogLevel, HttpTransportType } from "@microsoft/signalr";
import { API_URL } from "../environment";

export class ChatService {
    constructor() {
        this.handlers   = [];
        this.connection = null;
    }

    start(userId) {
        // Stop old connections
        if (this.connection) {
            this.connection.stop();
        }

        // Build a new connection
        this.connection = new HubConnectionBuilder()
            .withUrl(
                `${API_URL}/hubs/chat?userId=${encodeURIComponent(userId)}`,
                { transport: HttpTransportType.WebSockets }
            )
            .configureLogging(LogLevel.Information)
            .build();

        // wire up incoming
        this.connection.on("ReceiveEncryptedMessage", (msg) =>
            this.handlers.forEach((h) => h(msg))
        );

        // start
        return this.connection
            .start()
            .then(() => console.log("SignalR connected, ID=", this.connection.connectionId));
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

    sendPrivateMessage({ Sender, Recipient, Content }) {
        console.log("SendPrivateMessage:", { Recipient, Content });
        return this.connection.invoke("SendPrivateMessage", {
            Sender,
            Recipient,
            Content,
        });
    }
}
