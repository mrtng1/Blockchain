import React, { useEffect, useState, useMemo } from 'react';
import { ChatService } from '../service/ChatService';
import authService from '../service/AuthService';

export default function ChatComponent() {
    const [thisUser, setThisUser] = useState(null);
    const [recipient, setRecipient] = useState('');
    const [text, setText] = useState('');
    const [messages, setMessages] = useState([]);

    const chat = useMemo(() => new ChatService(), []);

    useEffect(() => {
        let isActive = true;

        const initializeChat = async () => {
            try {
                const username = authService.getUsername();
                if (!username) return;

                await chat.start(username);
                if (isActive) setThisUser(username);

                const unsub = chat.onMessage(m => {
                    if (isActive) setMessages(prev => [...prev, m]);
                });

                return () => unsub();
            } catch (error) {
                console.error("Chat initialization failed:", error);
            }
        };

        initializeChat();
        return () => {
            isActive = false;
            chat.stop().catch(() => {});
        };
    }, [chat]);

    const handleSend = async () => {
        if (!recipient || !text) return;

        try {
            await chat.sendPrivateMessage({ Recipient: recipient, Content: text });
            setText('');
            setMessages(prev => [...prev, {
                sender: thisUser,
                recipient,
                content: text
            }]);
        } catch (error) {
            console.error("Message send error:", error);
        }
    };

    return (
        <div style={styles.frame}>
            <div className="p-4">
                <label className="block mb-2">
                    <input
                        className="border p-1 ml-2"
                        style={styles.inputField}
                        placeholder="Recipient username"
                        value={recipient}
                        onChange={e => setRecipient(e.target.value)}
                    />
                </label>

                <div className="mb-4 flex items-center space-x-2">
                    <input
                        className="border p-1 flex-1"
                        style={styles.inputField}
                        placeholder="..."
                        value={text}
                        onChange={e => setText(e.target.value)}
                    />
                    <button
                        className="px-3 py-1 bg-blue-500 text-white rounded"
                        style={styles.button}
                        onClick={handleSend}
                        disabled={!recipient || !text}
                    >
                        Send
                    </button>
                </div>

                <h3 style={styles.messageHeader}>Messages:</h3>
                <ul style={styles.messageList}>
                    {messages.length === 0 && (
                        <p style={styles.noMessages}>No messages ...</p>
                    )}
                    {messages.map((m, i) => (
                        <li key={i} style={styles.messageBlock}>
                            <div style={styles.messageHeaderBlock}>
                <span style={styles.fromTo}>
                  {m.sender === thisUser ? 'Me' : m.sender} → {m.recipient === thisUser ? 'Me' : m.recipient}
                </span>
                            </div>
                            <div style={styles.contentBlock}>
                                {m.content}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

const styles = {
    frame: {
        border: '2px solid #ccc',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        width: '450px',
        margin: '20px auto',
        fontFamily: 'Arial, sans-serif',
    },
    inputField: {
        padding: '8px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        boxSizing: 'border-box',
    },
    button: {
        padding: '8px 15px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    messageHeader: {
        marginTop: '20px',
        marginBottom: '10px',
        color: '#333',
        fontSize: '1.1em',
    },
    messageList: {
        listStyleType: 'none',
        paddingLeft: 0,
        maxHeight: '300px',
        overflowY: 'auto',
    },
    noMessages: {
        textAlign: 'center',
        color: '#888',
        padding: '10px',
    },
    messageBlock: {
        marginBottom: '8px',
        padding: '6px 10px',
        border: '1px solid #eee',
        borderRadius: '6px',
        backgroundColor: '#fafafa',
        fontSize: '0.9em',
    },
    messageHeaderBlock: {
        marginBottom: '4px',
        fontWeight: 'bold',
        fontSize: '0.85em',
        color: '#555',
    },
    fromTo: {
        display: 'inline-block',
    },
    contentBlock: {
        fontSize: '0.9em',
        color: '#333',
        wordBreak: 'break-word',
    },
};
