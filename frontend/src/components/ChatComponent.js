import React, { useEffect, useState, useMemo } from 'react';
import { ChatService } from '../service/ChatService';
import authService from '../service/AuthService';

export default function ChatComponent() {
    const [me,        setMe]        = useState(null);
    const [recipient, setRecipient] = useState('');
    const [text,      setText]      = useState('');
    const [messages,  setMessages]  = useState([]);

    const chat = useMemo(() => new ChatService(), []);

    useEffect(() => {
        const username = authService.getUsername();
        setMe(username);

        chat.start(username).catch(console.error);

        const unsub = chat.onMessage((m) => setMessages((a) => [...a, m]));
        return () => { unsub(); chat.stop(); };
    }, [chat]);

    const handleSend = () => {
        if (!recipient || !text) return;
        chat.sendPrivateMessage({ Sender: me, Recipient: recipient, Content: text })
            .catch(console.error);
        setText('');
        messages.push({ sender: me, content: text });
    };

    return (
        <div style={styles.frame}>
            <div className="p-4">
                <h2 className="mb-2">You: {me}</h2>

                <label className="block mb-2">
                    Recipient ID:
                    <input
                        className="border p-1 ml-2"
                        style={styles.inputField}
                        placeholder="Enter recipient username"
                        value={recipient}
                        onChange={e => setRecipient(e.target.value)}
                    />
                </label>

                <div className="mb-4 flex items-center space-x-2">
                    <input
                        className="border p-1 flex-1"
                        style={styles.inputField}
                        placeholder="Message content"
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
                <ul className="list-disc pl-5" style={styles.messageList}>
                    {messages.map((m, i) => (
                        <li key={i} style={styles.messageItem}>
                            <strong>{m.sender === me ? 'Me' : m.sender} &rarr; </strong> {m.content}
                        </li>
                    ))}
                    {messages.length === 0 && <p style={styles.noMessages}>No messages ...</p>}
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
        paddingLeft: '0',
        maxHeight: '300px',
        overflowY: 'auto',
        border: '1px solid #eee',
        padding: '10px',
        borderRadius: '4px',
        backgroundColor: '#fff',
    },
    messageItem: {
        padding: '8px 0',
        borderBottom: '1px solid #eee',
        color: '#555',
    },
    noMessages: {
        textAlign: 'center',
        color: '#888',
        padding: '10px',
    }
};