import React, { useEffect, useState, useMemo } from 'react';
import { ChatService } from '../service/ChatService';
import authService from '../service/AuthService';

export default function ChatComponent() {
    const [currentUser, setCurrentUser] = useState(null);
    const [inputPeerUsername, setInputPeerUsername] = useState('');
    const [confirmedPeerUsername, setConfirmedPeerUsername] = useState('');

    const [text, setText] = useState('');
    const [messages, setMessages] = useState([]);
    const [isLoadingKeys, setIsLoadingKeys] = useState(false);
    const [keyExchangeError, setKeyExchangeError] = useState(null);

    const chat = useMemo(() => new ChatService(), []);

    // Effect to get current user identity
    useEffect(() => {
        const username = authService.getUsername();
        if (username) {
            setCurrentUser(username);
        } else {
            setKeyExchangeError("User not authenticated. Please log in.");
            setIsLoadingKeys(false);
        }
    }, []);

    // Effect for chat initialization
    useEffect(() => {
        let isActive = true;
        let unsubKeyExchange = null;
        let unsubMessages = null;
        let keyExchangeTimeoutId = null;

        const initializeChatSession = async (currentUsername, targetPeer) => {
            if (!isActive) return;
            console.log(`Initializing chat session: ${currentUsername} <-> ${targetPeer}`);
            setMessages([]); // Clear previous messages
            setText('');
            setKeyExchangeError(null);
            setIsLoadingKeys(true);

            unsubKeyExchange = chat.onKeyExchangeComplete(() => {
                if (isActive) {
                    clearTimeout(keyExchangeTimeoutId);
                    setIsLoadingKeys(false);
                    setKeyExchangeError(null);
                }
            });

            keyExchangeTimeoutId = setTimeout(() => {
                if (isActive && isLoadingKeys) {
                    console.error(`Key exchange timeout with ${targetPeer}.`);
                    setKeyExchangeError(`Key exchange with ${targetPeer} timed out. Please check peer username or try again.`);
                    setIsLoadingKeys(false);
                    chat.stop().catch(e => console.warn("Error stopping chat on timeout", e));
                }
            }, 25000); // 25 seconds timeout

            try {
                await chat.start(currentUsername, targetPeer);
                if (isActive && chat.areKeysExchanged()) {
                    clearTimeout(keyExchangeTimeoutId);
                    setIsLoadingKeys(false);
                    setKeyExchangeError(null);
                }

                unsubMessages = chat.onMessage(m => {
                    if (isActive) {
                        setMessages(prev => [...prev, m]);
                    }
                });

            } catch (error) {
                console.error(`Chat initialization or key exchange with ${targetPeer} failed:`, error);
                if (isActive) {
                    clearTimeout(keyExchangeTimeoutId);
                    setKeyExchangeError(error.message || `Failed to initialize secure chat with ${targetPeer}.`);
                    setIsLoadingKeys(false);
                }
            }
        };

        if (currentUser && confirmedPeerUsername) {
            initializeChatSession(currentUser, confirmedPeerUsername);
        } else {
            chat.stop().catch(err => console.warn("Error stopping chat service when peer/user is not confirmed:", err));
            setIsLoadingKeys(false);
        }

        return () => { // Cleanup function
            isActive = false;
            clearTimeout(keyExchangeTimeoutId);
            if (unsubKeyExchange) unsubKeyExchange();
            if (unsubMessages) unsubMessages();
            console.log("ChatComponent cleanup: stopping chat service.");
            chat.stop().catch(err => console.warn("Error stopping chat service on cleanup:", err));
        };
    }, [chat, currentUser, confirmedPeerUsername])

    const handlePeerConnect = () => {
        if (!inputPeerUsername.trim()) {
            setKeyExchangeError("Please enter a peer username.");
            return;
        }
        if (!currentUser) {
            setKeyExchangeError("Current user not identified. Cannot connect.");
            return;
        }
        if (inputPeerUsername.trim().toLowerCase() === currentUser.toLowerCase()) {
            setKeyExchangeError("Cannot start a chat with yourself.");
            return;
        }
        setKeyExchangeError(null); // Clear previous errors
        setConfirmedPeerUsername(inputPeerUsername.trim());
    };

    const handleDisconnectOrChangePeer = () => {
        setInputPeerUsername('');
        setConfirmedPeerUsername('');
        setMessages([]);
        setText('');
        setKeyExchangeError(null);
        setIsLoadingKeys(false);
    };

    const handleSend = async () => {
        if (!confirmedPeerUsername || !text.trim() || isLoadingKeys || keyExchangeError) {
            console.warn("Cannot send message. Conditions not met.");
            return;
        }
        const messageContent = text;
        setText(''); // clear input field

        try {
            // Optimistically add message to UI
            setMessages(prev => [...prev, {
                sender: currentUser,
                recipient: confirmedPeerUsername,
                content: messageContent,
                timestamp: new Date().toISOString() // Add timestamp for local display
            }]);
            await chat.sendPrivateMessage({ Recipient: confirmedPeerUsername, Content: messageContent });
        } catch (error) {
            console.error("Message send error:", error);
            setKeyExchangeError(`Failed to send message: ${error.message}. You may need to refresh or reconnect.`);
            setMessages(prev => prev.filter(m => m.content !== messageContent || m.sender !== currentUser));
            setText(messageContent); // Restore text
        }
    };

    // UI Rendering Logic
    if (!currentUser) {
        return (
            <div style={styles.frame}>
                <p style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
                    {keyExchangeError || "Authenticating user..."}
                </p>
            </div>
        );
    }

    if (!confirmedPeerUsername) {
        return (
            <div style={styles.frame}>
                <div className="p-4">
                    <h3 style={styles.messageHeader}>Connect to a Peer</h3>
                    <p>Logged in as: <strong>{currentUser}</strong></p>
                    <div className="mb-3">
                        <input
                            type="text"
                            className="border p-1 flex-1"
                            style={{ ...styles.inputField, width: 'calc(100% - 22px)', marginBottom: '10px' }}
                            placeholder="Enter Peer's Username"
                            value={inputPeerUsername}
                            onChange={e => setInputPeerUsername(e.target.value)}
                            onKeyPress={(e) => { if (e.key === 'Enter') handlePeerConnect(); }}
                        />
                        <button
                            className="px-3 py-1 bg-green-500 text-white rounded"
                            style={{...styles.button, backgroundColor: '#28a745', width: '100%'}}
                            onClick={handlePeerConnect}
                        >
                            Connect to Peer
                        </button>
                    </div>
                    {keyExchangeError && <p style={{ color: 'red', marginTop: '10px' }}>{keyExchangeError}</p>}
                </div>
            </div>
        );
    }

    if (isLoadingKeys) {
        return (
            <div style={styles.frame}>
                <p style={{ textAlign: 'center', padding: '20px', color: '#007bff' }}>
                    Establishing secure session with <strong>{confirmedPeerUsername}</strong>... Exchanging keys...
                </p>
                <button onClick={handleDisconnectOrChangePeer} style={{...styles.button, backgroundColor: '#dc3545', display: 'block', margin: '10px auto'}}>Cancel</button>
            </div>
        );
    }

    if (keyExchangeError) {
        return (
            <div style={styles.frame}>
                <p style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
                    <strong>Error:</strong> {keyExchangeError}
                </p>
                <button onClick={handleDisconnectOrChangePeer} style={{...styles.button, backgroundColor: '#6c757d', display: 'block', margin: '10px auto'}}>Try New Peer</button>
            </div>
        );
    }

    // Main Chat UI
    const canChat = !isLoadingKeys && !keyExchangeError && currentUser && confirmedPeerUsername;
    return (
        <div style={styles.frame}>
            <div className="p-4">
                <div className="mb-3" style={{ paddingBottom: '10px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        Logged in as: <strong>{currentUser}</strong> <br />
                        Chatting with: <strong>{confirmedPeerUsername}</strong>
                    </div>
                    <button onClick={handleDisconnectOrChangePeer} style={{...styles.button, backgroundColor: '#6c757d', padding: '5px 10px'}}>
                        Change Peer
                    </button>
                </div>

                <div className="mb-4 flex items-center space-x-2">
                    <input
                        className="border p-1 flex-1"
                        style={styles.inputField}
                        placeholder={canChat ? "Type your message..." : "Waiting for secure session..."}
                        value={text}
                        onChange={e => setText(e.target.value)}
                        disabled={!canChat}
                        onKeyPress={(e) => { if (e.key === 'Enter' && text.trim()) handleSend(); }}
                    />
                    <button
                        className="px-3 py-1 bg-blue-500 text-white rounded"
                        style={styles.button}
                        onClick={handleSend}
                        disabled={!canChat || !text.trim()}
                    >
                        Send
                    </button>
                </div>

                <h3 style={styles.messageHeader}>Messages:</h3>
                <ul style={styles.messageList}>
                    {messages.length === 0 && (
                        <p style={styles.noMessages}>No messages yet with {confirmedPeerUsername}...</p>
                    )}
                    {messages.map((m, i) => (
                        <li key={m.timestamp + i} style={styles.messageBlock}>
                            <div style={styles.messageHeaderBlock}>
                                <span style={styles.fromTo}>
                                  {m.sender === currentUser ? 'Me' : (m.sender || 'Unknown')} → {m.recipient === currentUser ? 'Me' : (m.recipient || 'Unknown')}
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

// Your existing styles object
const styles = {
    frame: {
        border: '2px solid #ccc',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        width: '450px',
        margin: '20px auto',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#fff',
    },
    inputField: {
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        boxSizing: 'border-box',
        width: '100%',
    },
    button: {
        padding: '10px 15px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
    },
    messageHeader: {
        marginTop: '20px',
        marginBottom: '10px',
        color: '#333',
        fontSize: '1.1em',
        fontWeight: 'bold',
    },
    messageList: {
        listStyleType: 'none',
        paddingLeft: 0,
        maxHeight: '300px',
        overflowY: 'auto',
        border: '1px solid #eee',
        padding: '10px',
        borderRadius: '4px',
        backgroundColor: '#f9f9f9',
    },
    noMessages: {
        textAlign: 'center',
        color: '#888',
        padding: '20px 0',
        fontStyle: 'italic',
    },
    messageBlock: {
        marginBottom: '10px',
        padding: '8px 12px',
        border: '1px solid #e0e0e0',
        borderRadius: '6px',
        backgroundColor: '#ffffff',
        fontSize: '0.95em',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    },
    messageHeaderBlock: {
        marginBottom: '5px',
        fontWeight: 'bold',
        fontSize: '0.8em',
        color: '#555',
    },
    fromTo: {
        display: 'inline-block',
        color: '#007bff',
    },
    contentBlock: {
        fontSize: '1em',
        color: '#333',
        wordBreak: 'break-word',
    },
};