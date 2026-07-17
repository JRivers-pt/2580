import React, { useState, useEffect } from 'react';

const CookieBanner = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('rgpd_consent');
        if (!consent) setVisible(true);
    }, []);

    const accept = () => {
        localStorage.setItem('rgpd_consent', 'accepted');
        setVisible(false);
    };

    const decline = () => {
        localStorage.setItem('rgpd_consent', 'declined');
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div style={{
            position: 'fixed', bottom: '72px', left: '50%', transform: 'translateX(-50%)',
            width: 'min(420px, 94vw)', zIndex: 999,
            background: '#1F2937', color: 'white',
            borderRadius: '16px', padding: '16px 18px',
            boxShadow: '0 -4px 32px rgba(0,0,0,0.25)',
            display: 'flex', flexDirection: 'column', gap: '12px',
            animation: 'slideUp 0.3s ease',
        }}>
            <style>{`
                @keyframes slideUp {
                    from { transform: translateX(-50%) translateY(20px); opacity: 0; }
                    to   { transform: translateX(-50%) translateY(0); opacity: 1; }
                }
            `}</style>
            <div>
                <div style={{ fontWeight: '700', fontSize: '0.95rem', marginBottom: '6px' }}>
                    🍪 Privacidade & Cookies
                </div>
                <p style={{ fontSize: '0.8rem', color: '#D1D5DB', margin: 0, lineHeight: 1.5 }}>
                    Usamos cookies essenciais para o funcionamento da plataforma. 
                    Em conformidade com o RGPD, precisamos do seu consentimento para guardar dados de sessão.{' '}
                    <a href="https://www.cnpd.pt/" target="_blank" rel="noopener noreferrer" style={{ color: '#10B981', fontWeight: '600' }}>
                        Saber mais
                    </a>
                </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
                <button
                    onClick={accept}
                    style={{
                        flex: 2, padding: '10px', borderRadius: '10px',
                        background: '#10B981', color: 'white',
                        border: 'none', fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer',
                    }}
                >
                    ✅ Aceitar
                </button>
                <button
                    onClick={decline}
                    style={{
                        flex: 1, padding: '10px', borderRadius: '10px',
                        background: 'rgba(255,255,255,0.1)', color: '#D1D5DB',
                        border: '1px solid rgba(255,255,255,0.15)', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer',
                    }}
                >
                    Recusar
                </button>
            </div>
        </div>
    );
};

export default CookieBanner;
