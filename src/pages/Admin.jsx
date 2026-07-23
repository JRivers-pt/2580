import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

const inputStyle = { padding: '10px', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontFamily: 'inherit', fontSize: '0.95rem', width: '100%', boxSizing: 'border-box' };
const btnStyle = (color) => ({ padding: '10px 16px', background: color, color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '0.95rem' });
const cardStyle = (border) => ({ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderLeft: `5px solid ${border}` });

const Admin = () => {
    const [session, setSession] = useState(null);
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('news');

    // Form states
    const [news, setNews] = useState({ title: '', body: '' });
    const [premium, setPremium] = useState({ title: '', price: '', contact: '', description: '', type: 'Sale' });
    const [business, setBusiness] = useState({ name: '', category: 'Comércio', address: '', phone: '', description: '', website: '', instagram: '', is_premium: false });
    const [ad, setAd] = useState({ title: '', description: '', gradient: 'linear-gradient(135deg, #10B981 0%, #3B82F6 100%)', link_url: '', is_active: true });
    const [alert, setAlert] = useState({ type: 'info', title: '', body: '', location: '', is_verified: false });
    const [pendingItems, setPendingItems] = useState({ boleias: [], perdidos: [] });

    const TABS = [
        { key: 'news', label: '📢 Notícias', color: '#10B981' },
        { key: 'premium', label: '⭐ Listing Premium', color: '#F59E0B' },
        { key: 'business', label: '🏪 Diretório', color: '#3B82F6' },
        { key: 'ads', label: '📣 Banners', color: '#6366F1' },
        { key: 'alerts', label: '🛡️ Alertas', color: '#EF4444' },
        { key: 'pendentes', label: '⏳ Pendentes', color: '#8B5CF6' },
    ];

    useEffect(() => {
        if (!supabase) return;
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session) fetchPending();
        });
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
            setSession(s);
            if (s) fetchPending();
        });
        return () => subscription.unsubscribe();
    }, []);

    const fetchPending = async () => {
        const { data: bData } = await supabase.from('boleia').select('*').eq('status', 'pending');
        const { data: pData } = await supabase.from('perdidos_achados').select('*').eq('status', 'pending');
        setPendingItems({ boleias: bData || [], perdidos: pData || [] });
    };

    const approveItem = async (table, id) => {
        const { error } = await supabase.from(table).update({ status: 'approved' }).eq('id', id);
        if (!error) {
            window.alert('✅ Aprovado com sucesso!');
            fetchPending();
        } else {
            window.alert('Erro ao aprovar: ' + error.message);
        }
    };

    const rejectItem = async (table, id) => {
        const { error } = await supabase.from(table).delete().eq('id', id);
        if (!error) {
            fetchPending();
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (!supabase) {
                window.alert('Erro: Conexão à base de dados não configurada. As variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão em falta na Vercel.');
                setLoading(false);
                return;
            }
            const { error } = await supabase.auth.signInWithOtp({ email });
            if (error) window.alert(error.message);
            else window.alert('✅ Verifique o seu email para o link de acesso!');
        } catch (err) {
            window.alert('Erro inesperado: ' + err.message);
        }
        setLoading(false);
    };

    const post = async (table, data, reset, successMsg) => {
        if (!session || !supabase) return;
        const { error } = await supabase.from(table).insert([data]);
        if (error) { alert('Erro: ' + error.message); }
        else { alert('✅ ' + successMsg); reset(); }
    };

    if (!session) {
        return (
            <div className="container" style={{ maxWidth: '420px' }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🔐</div>
                    <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Admin 2580</h1>
                    <p style={{ color: '#6B7280', margin: '8px 0 0 0', fontSize: '0.9rem' }}>Acesso restrito ao administrador</p>
                </div>
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <input type="email" placeholder="O seu email" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} />
                    <button type="submit" disabled={loading} style={btnStyle('#10B981')}>
                        {loading ? 'A enviar...' : 'Enviar Magic Link'}
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="container" style={{ maxWidth: '700px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.4rem' }}>🛠️ Admin 2580</h1>
                    <p style={{ color: '#6B7280', margin: '4px 0 0 0', fontSize: '0.85rem' }}>{session.user.email}</p>
                </div>
                <button onClick={() => supabase.auth.signOut()} style={{ ...btnStyle('#e5e7eb'), color: '#374151', fontSize: '0.85rem', padding: '8px 14px' }}>
                    Sair
                </button>
            </div>

            {/* Tab navigation */}
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', marginBottom: '20px', paddingBottom: '4px', scrollbarWidth: 'none' }}>
                {TABS.map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                        whiteSpace: 'nowrap', padding: '8px 14px', borderRadius: '8px', border: 'none',
                        fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s',
                        background: activeTab === tab.key ? tab.color : '#f3f4f6',
                        color: activeTab === tab.key ? 'white' : '#374151',
                    }}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* News tab */}
            {activeTab === 'news' && (
                <div style={cardStyle('#10B981')}>
                    <h2 style={{ margin: '0 0 16px 0' }}>📢 Publicar Notícia</h2>
                    <form onSubmit={e => { e.preventDefault(); post('news', news, () => setNews({ title: '', body: '' }), 'Notícia publicada!'); }} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <input type="text" placeholder="Título" value={news.title} onChange={e => setNews({ ...news, title: e.target.value })} required style={inputStyle} />
                        <textarea placeholder="Corpo da notícia..." value={news.body} onChange={e => setNews({ ...news, body: e.target.value })} required style={{ ...inputStyle, minHeight: '120px' }} />
                        <button type="submit" style={btnStyle('#10B981')}>Publicar Notícia</button>
                    </form>
                </div>
            )}

            {/* Premium listing tab */}
            {activeTab === 'premium' && (
                <div style={cardStyle('#F59E0B')}>
                    <h2 style={{ margin: '0 0 4px 0' }}>⭐ Listing Premium</h2>
                    <p style={{ color: '#92400E', fontSize: '0.82rem', margin: '0 0 16px 0', background: '#FFFBEB', padding: '8px', borderRadius: '6px' }}>
                        ⚠️ Usar apenas após confirmar pagamento do cliente.
                    </p>
                    <form onSubmit={e => { e.preventDefault(); post('housing_listings', { ...premium, is_premium: true }, () => setPremium({ title: '', price: '', contact: '', description: '', type: 'Sale' }), 'Listing premium publicado!'); }} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <select value={premium.type} onChange={e => setPremium({ ...premium, type: e.target.value })} style={inputStyle}>
                            <option value="Sale">Venda</option>
                            <option value="Rent">Arrendamento Premium</option>
                        </select>
                        <input type="text" placeholder="Título (ex: T3 Luxo Carregado)" value={premium.title} onChange={e => setPremium({ ...premium, title: e.target.value })} required style={inputStyle} />
                        <input type="text" placeholder="Preço (ex: €250,000)" value={premium.price} onChange={e => setPremium({ ...premium, price: e.target.value })} required style={inputStyle} />
                        <input type="text" placeholder="Contacto" value={premium.contact} onChange={e => setPremium({ ...premium, contact: e.target.value })} required style={inputStyle} />
                        <textarea placeholder="Descrição..." value={premium.description} onChange={e => setPremium({ ...premium, description: e.target.value })} style={{ ...inputStyle, minHeight: '100px' }} />
                        <button type="submit" style={btnStyle('#F59E0B')}>Publicar Listing Premium</button>
                    </form>
                </div>
            )}

            {/* Business directory tab */}
            {activeTab === 'business' && (
                <div style={cardStyle('#3B82F6')}>
                    <h2 style={{ margin: '0 0 16px 0' }}>🏪 Adicionar ao Diretório</h2>
                    <form onSubmit={e => { e.preventDefault(); post('businesses', { ...business, is_active: true }, () => setBusiness({ name: '', category: 'Comércio', address: '', phone: '', description: '', website: '', instagram: '', is_premium: false }), 'Negócio adicionado!'); }} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <input type="text" placeholder="Nome do negócio" value={business.name} onChange={e => setBusiness({ ...business, name: e.target.value })} required style={inputStyle} />
                        <select value={business.category} onChange={e => setBusiness({ ...business, category: e.target.value })} style={inputStyle}>
                            {['Restaurantes','Cafés','Comércio','Serviços','Saúde','Auto','Beleza','Outros'].map(c => <option key={c}>{c}</option>)}
                        </select>
                        <input type="text" placeholder="Morada" value={business.address} onChange={e => setBusiness({ ...business, address: e.target.value })} style={inputStyle} />
                        <input type="text" placeholder="Telefone" value={business.phone} onChange={e => setBusiness({ ...business, phone: e.target.value })} style={inputStyle} />
                        <textarea placeholder="Descrição do negócio" value={business.description} onChange={e => setBusiness({ ...business, description: e.target.value })} style={{ ...inputStyle, minHeight: '80px' }} />
                        <input type="text" placeholder="Website (https://...)" value={business.website} onChange={e => setBusiness({ ...business, website: e.target.value })} style={inputStyle} />
                        <input type="text" placeholder="Instagram (sem @)" value={business.instagram} onChange={e => setBusiness({ ...business, instagram: e.target.value })} style={inputStyle} />
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', cursor: 'pointer' }}>
                            <input type="checkbox" checked={business.is_premium} onChange={e => setBusiness({ ...business, is_premium: e.target.checked })} />
                            Destaque Premium (pago)
                        </label>
                        <button type="submit" style={btnStyle('#3B82F6')}>Adicionar Negócio</button>
                    </form>
                </div>
            )}

            {/* Ads/Banner tab */}
            {activeTab === 'ads' && (
                <div style={cardStyle('#6366F1')}>
                    <h2 style={{ margin: '0 0 4px 0' }}>📣 Criar Banner</h2>
                    <p style={{ color: '#4338CA', fontSize: '0.82rem', margin: '0 0 16px 0', background: '#EEF2FF', padding: '8px', borderRadius: '6px' }}>
                        ⚠️ Usar após confirmar pagamento do anunciante.
                    </p>
                    <form onSubmit={e => { e.preventDefault(); post('ads', { ...ad, link_url: ad.link_url || null, is_active: true }, () => setAd({ title: '', description: '', gradient: 'linear-gradient(135deg, #10B981 0%, #3B82F6 100%)', link_url: '', is_active: true }), 'Banner publicado!'); }} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <input type="text" placeholder="Nome do negócio / título" value={ad.title} onChange={e => setAd({ ...ad, title: e.target.value })} required style={inputStyle} />
                        <input type="text" placeholder="Texto do anúncio" value={ad.description} onChange={e => setAd({ ...ad, description: e.target.value })} style={inputStyle} />
                        <div>
                            <label style={{ fontSize: '0.85rem', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Cor do banner (gradient CSS):</label>
                            <select value={ad.gradient} onChange={e => setAd({ ...ad, gradient: e.target.value })} style={inputStyle}>
                                <option value="linear-gradient(135deg, #10B981 0%, #3B82F6 100%)">Verde → Azul</option>
                                <option value="linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)">Âmbar → Vermelho</option>
                                <option value="linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)">Índigo → Roxo</option>
                                <option value="linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)">Azul escuro</option>
                                <option value="linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)">Vermelho</option>
                            </select>
                            <div style={{ marginTop: '8px', height: '40px', borderRadius: '8px', background: ad.gradient }} />
                        </div>
                        <input type="text" placeholder="Link (https://...) — opcional" value={ad.link_url} onChange={e => setAd({ ...ad, link_url: e.target.value })} style={inputStyle} />
                        <button type="submit" style={btnStyle('#6366F1')}>Publicar Banner</button>
                    </form>
                </div>
            )}

            {/* Alerts tab */}
            {activeTab === 'alerts' && (
                <div style={cardStyle('#EF4444')}>
                    <h2 style={{ margin: '0 0 16px 0' }}>🛡️ Publicar Alerta Verificado</h2>
                    <form onSubmit={e => { e.preventDefault(); post('alerts', { ...alert, author: 'Admin 2580', is_active: true }, () => setAlert({ type: 'info', title: '', body: '', location: '', is_verified: false }), 'Alerta publicado!'); }} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <select value={alert.type} onChange={e => setAlert({ ...alert, type: e.target.value })} style={inputStyle}>
                            <option value="urgent">🚨 Urgente</option>
                            <option value="scam">⚠️ Burla / Fraude</option>
                            <option value="safety">🛡️ Segurança</option>
                            <option value="info">ℹ️ Informação</option>
                        </select>
                        <input type="text" placeholder="Título do alerta" value={alert.title} onChange={e => setAlert({ ...alert, title: e.target.value })} required style={inputStyle} />
                        <textarea placeholder="Descrição completa..." value={alert.body} onChange={e => setAlert({ ...alert, body: e.target.value })} required style={{ ...inputStyle, minHeight: '100px' }} />
                        <input type="text" placeholder="Localização (opcional)" value={alert.location} onChange={e => setAlert({ ...alert, location: e.target.value })} style={inputStyle} />
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', cursor: 'pointer' }}>
                            <input type="checkbox" checked={alert.is_verified} onChange={e => setAlert({ ...alert, is_verified: e.target.checked })} />
                            Marcar como Verificado ✓
                        </label>
                        <button type="submit" style={btnStyle('#EF4444')}>Publicar Alerta</button>
                    </form>
                </div>
            )}

            {/* Pendentes tab */}
            {activeTab === 'pendentes' && (
                <div style={cardStyle('#8B5CF6')}>
                    <h2 style={{ margin: '0 0 16px 0' }}>⏳ Aguardar Aprovação</h2>
                    <p style={{ color: '#4B5563', fontSize: '0.9rem', marginBottom: '20px' }}>
                        Analise os envios da comunidade antes de serem publicados.
                    </p>

                    <h3 style={{ fontSize: '1.1rem', marginTop: '20px' }}>🚗 Boleias ({pendingItems.boleias.length})</h3>
                    {pendingItems.boleias.length === 0 ? <p style={{ fontSize: '0.85rem', color: '#9CA3AF' }}>Nenhuma boleia pendente.</p> : null}
                    {pendingItems.boleias.map(b => (
                        <div key={b.id} style={{ padding: '12px', border: '1px solid #E5E7EB', borderRadius: '8px', marginBottom: '10px' }}>
                            <div style={{ fontWeight: '600' }}>{b.origin} → {b.destination}</div>
                            <div style={{ fontSize: '0.85rem', color: '#6B7280', margin: '4px 0' }}>Data: {b.date} | Contacto: {b.contact}</div>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                                <button onClick={() => approveItem('boleia', b.id)} style={{ ...btnStyle('#10B981'), padding: '6px 12px', fontSize: '0.8rem' }}>Aprovar</button>
                                <button onClick={() => rejectItem('boleia', b.id)} style={{ ...btnStyle('#EF4444'), padding: '6px 12px', fontSize: '0.8rem' }}>Rejeitar / Apagar</button>
                            </div>
                        </div>
                    ))}

                    <h3 style={{ fontSize: '1.1rem', marginTop: '20px' }}>❤️ Perdidos & Achados ({pendingItems.perdidos.length})</h3>
                    {pendingItems.perdidos.length === 0 ? <p style={{ fontSize: '0.85rem', color: '#9CA3AF' }}>Nenhum item pendente.</p> : null}
                    {pendingItems.perdidos.map(p => (
                        <div key={p.id} style={{ padding: '12px', border: '1px solid #E5E7EB', borderRadius: '8px', marginBottom: '10px' }}>
                            <div style={{ fontWeight: '600' }}>{p.title}</div>
                            <div style={{ fontSize: '0.85rem', color: '#6B7280', margin: '4px 0' }}>{p.description}</div>
                            <div style={{ fontSize: '0.85rem', color: '#6B7280', margin: '4px 0' }}>Contacto: {p.contact}</div>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                                <button onClick={() => approveItem('perdidos_achados', p.id)} style={{ ...btnStyle('#10B981'), padding: '6px 12px', fontSize: '0.8rem' }}>Aprovar</button>
                                <button onClick={() => rejectItem('perdidos_achados', p.id)} style={{ ...btnStyle('#EF4444'), padding: '6px 12px', fontSize: '0.8rem' }}>Rejeitar / Apagar</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Admin;
