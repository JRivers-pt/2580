import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Mic } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { chatWithGemini } from '../services/gemini';
import styles from './AIAssistant.module.css';

const AIAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();

    const [messages, setMessages] = useState([]);

    // Initialize greeting on open
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([{ role: 'ai', text: t('ai_help') }]);
        }
    }, [isOpen, t]);

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input;
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInput('');
        setLoading(true);

        const aiResponse = await chatWithGemini(userMsg);

        setMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
        setLoading(false);
    };

    return (
        <>
            {/* Floating Action Button */}
            {!isOpen && (
                <button
                    className={styles.fab}
                    onClick={() => setIsOpen(true)}
                    aria-label="Open AI Assistant"
                >
                    <MessageCircle size={32} />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className={styles.chatWindow}>
                    <div className={styles.header}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div className={styles.avatar}>AI</div>
                            <span style={{ fontWeight: '700' }}>Assistant</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} className={styles.closeBtn}>
                            <X size={20} />
                        </button>
                    </div>

                    <div className={styles.messages}>
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`${styles.bubble} ${msg.role === 'user' ? styles.user : styles.ai}`}>
                                {msg.text}
                            </div>
                        ))}
                        {loading && <div className={`${styles.bubble} ${styles.ai}`}>Typing...</div>}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSend} className={styles.inputArea}>
                        <button type="button" className={styles.iconBtn}><Mic size={20} /></button>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={t('ai_placeholder')}
                            className={styles.input}
                        />
                        <button type="submit" disabled={!input.trim() || loading} className={styles.sendBtn}>
                            <Send size={20} />
                        </button>
                    </form>
                </div>
            )}
        </>
    );
};

export default AIAssistant;
