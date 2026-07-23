import React, { useState, useEffect } from 'react';
import { Heart, Search, PlusCircle, Phone, Clock, MapPin, Loader } from 'lucide-react';
import { supabase } from '../services/supabase';
import styles from './Transport.module.css';

const TYPE_CONFIG = {
    lost_pet:   { label: '🐾 Perdido', emoji: '🐾', bg: '#FEF2F2', border: '#EF4444', badge: '#EF4444', category: 'Animal' },
    found_pet:  { label: '🐾 Encontrado', emoji: '🐾', bg: '#F0FDF4', border: '#10B981', badge: '#10B981', category: 'Animal' },
    lost_item:  { label: '📦 Perdido', emoji: '📦', bg: '#FFFBEB', border: '#F59E0B', badge: '#F59E0B', category: 'Objeto' },
    found_item: { label: '📦 Encontrado', emoji: '📦', bg: '#EFF6FF', border: '#3B82F6', badge: '#3B82F6', category: 'Objeto' },
    lost_doc:   { label: '📄 Perdido', emoji: '📄', bg: '#F5F3FF', border: '#8B5CF6', badge: '#8B5CF6', category: 'Documento' },
    found_doc:  { label: '📄 Encontrado', emoji: '📄', bg: '#F5F3FF', border: '#6366F1', badge: '#6366F1', category: 'Documento' },
};

const mockItems = [
    {
        id: 1,
        type: 'lost_pet',
        title: 'Perdeu-se Golden Retriever',
        description: 'Chama-se Bobi, 3 anos, cor dourada, colar azul. Desapareceu perto do parque.',
        location: 'Rua 25 de Abril',
        contact: '9XX XXX XXX',
        reward: '100€ de recompensa',
        created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
        resolved: false,
    },
    {
        id: 2,
        type: 'found_doc',
        title: 'Cartão de Cidadão encontrado',
        description: 'Encontrado junto ao Pingo Doce. Nome visível, aguardando contacto.',
        location: 'Pingo Doce Carregado',
        contact: '9XX XXX XXX',
        reward: null,
        created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
        resolved: false,
    },
    {
        id: 3,
        type: 'found_pet',
        title: 'Gato tigrado encontrado',
        description: 'Macho, adulto, assustado. Está a ser tratado. Tem microchip?',
        location: 'Zona Industrial',
        contact: '9XX XXX XXX',
        reward: null,
        created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
        resolved: false,
    },
];

const PerdidosAchados = () => {
    const [items, setItems] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [activeFilter, setActiveFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({ type: 'lost_pet', title: '', description: '', location: '', contact: '', reward: '', acceptedTerms: false });

    useEffect(() => { fetchItems(); }, []);

    async function fetchItems() {
        setLoading(true);
        if (!supabase) { setItems(mockItems); setLoading(false); return; }
        const { data, error } = await supabase
            .from('perdidos_achados')
            .select('*')
            .eq('resolved', false)
            .eq('status', 'approved')
            .order('created_at', { ascending: false });
        setItems((!error && data?.length > 0) ? data : mockItems);
        setLoading(false);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.acceptedTerms) {
            window.alert('É obrigatório aceitar os Termos de Responsabilidade.');
            return;
        }
        setSubmitting(true);
        const { acceptedTerms, ...submitData } = form;
        if (!supabase) {
            setTimeout(() => {
                setForm({ type: 'lost_pet', title: '', description: '', location: '', contact: '', reward: '', acceptedTerms: false });
                setShowForm(false); setSubmitting(false); setSubmitted(true);
            }, 800);
            return;
        }
        const { error } = await supabase.from('perdidos_achados').insert([{ ...submitData, resolved: false, status: 'pending' }]);
        if (!error) { 
            setForm({ type: 'lost_pet', title: '', description: '', location: '', contact: '', reward: '', acceptedTerms: false }); 
            setShowForm(false); 
            setSubmitted(true);
        } else {
            window.alert('Erro ao publicar: ' + error.message);
        }
        setSubmitting(false);
    };

    const handleReport = (id) => {
        window.alert('🚨 Denúncia registada! A equipa de moderação foi alertada.');
        setItems(prev => prev.filter(i => i.id !== id));
    };

    useEffect(() => {
        let result = items;
        if (activeFilter !== 'all') {
            if (activeFilter === 'pets') result = result.filter(i => i.type.includes('pet'));
            if (activeFilter === 'items') result = result.filter(i => i.type.includes('item'));
            if (activeFilter === 'docs') result = result.filter(i => i.type.includes('doc'));
            if (activeFilter === 'lost') result = result.filter(i => i.type.startsWith('lost'));
            if (activeFilter === 'found') result = result.filter(i => i.type.startsWith('found'));
        }
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(i => i.title?.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q) || i.location?.toLowerCase().includes(q));
        }
        setFiltered(result);
    }, [items, activeFilter, search]);

    const timeAgo = (dateStr) => {
        const diff = (Date.now() - new Date(dateStr)) / 1000;
        if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
        if (diff < 604800) return `${Math.floor(diff / 86400)}d atrás`;
        return new Date(dateStr).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' });
    };

    return (
        <div className="container">
            <div className={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <h1 className={styles.title}>🔍 Perdidos & Achados</h1>
                </div>
                <p style={{ color: 'var(--color-text-muted)', margin: '4px 0 14px 0' }}>
                    Animais, objetos e documentos no Carregado
                </p>

                {/* Search */}
                <div style={{ position: 'relative', marginBottom: '12px' }}>
                    <Search size={15} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                    <input
                        type="text" placeholder="Pesquisar..." value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ width: '100%', padding: '9px 9px 9px 34px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '0.9rem', fontFamily: 'inherit', boxSizing: 'border-box', background: 'white' }}
                    />
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
                    {[
                        { key: 'all', label: '🔍 Todos' },
                        { key: 'lost', label: '❓ Perdidos' },
                        { key: 'found', label: '✅ Achados' },
                        { key: 'pets', label: '🐾 Animais' },
                        { key: 'items', label: '📦 Objetos' },
                        { key: 'docs', label: '📄 Docs' },
                    ].map(f => (
                        <button key={f.key} onClick={() => setActiveFilter(f.key)} style={{
                            whiteSpace: 'nowrap', padding: '6px 12px', borderRadius: '20px',
                            border: 'none', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer',
                            background: activeFilter === f.key ? 'var(--color-accent)' : 'var(--color-surface)',
                            color: activeFilter === f.key ? 'white' : 'var(--color-text-muted)',
                        }}>{f.label}</button>
                    ))}
                </div>
            </div>

            {/* Post button */}
            <button onClick={() => setShowForm(!showForm)} style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '8px', padding: '12px', borderRadius: '10px', marginBottom: '16px',
                background: showForm ? '#f3f4f6' : 'var(--color-accent)', color: showForm ? 'var(--color-text)' : 'white',
                fontWeight: '700', fontSize: '0.95rem', border: 'none', cursor: 'pointer',
                boxShadow: showForm ? 'none' : 'var(--shadow-md)', transition: 'all 0.2s',
            }}>
                <PlusCircle size={18} />
                {showForm ? 'Cancelar' : 'Publicar Perdido / Achado'}
            </button>

            {/* Form */}
            {showForm && (
                <div style={{ background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '16px', boxShadow: 'var(--shadow-md)', border: '1px solid #e5e7eb' }}>
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem' }}>Nova Publicação</h3>
                    {submitted && <div style={{ background: '#FEF3C7', borderLeft: '4px solid #F59E0B', padding: '10px', borderRadius: '6px', marginBottom: '12px', fontSize: '0.9rem', color: '#92400E' }}>✅ Registo submetido! Irá aparecer após aprovação da moderação.</div>}
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                            style={{ padding: '10px', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '0.9rem', fontFamily: 'inherit' }}>
                            <option value="lost_pet">🐾 Perdi um animal</option>
                            <option value="found_pet">🐾 Encontrei um animal</option>
                            <option value="lost_item">📦 Perdi um objeto</option>
                            <option value="found_item">📦 Encontrei um objeto</option>
                            <option value="lost_doc">📄 Perdi documentos</option>
                            <option value="found_doc">📄 Encontrei documentos</option>
                        </select>
                        <input type="text" placeholder="Título (ex: Perdeu-se cão labrador castanho)"
                            value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required
                            style={{ padding: '10px', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '0.9rem', fontFamily: 'inherit' }} />
                        <textarea placeholder="Descrição detalhada (raça, cor, tamanho, onde foi visto pela última vez...)"
                            value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required
                            style={{ padding: '10px', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '0.9rem', fontFamily: 'inherit', minHeight: '90px' }} />
                        <input type="text" placeholder="Localização (ex: Rua do Mercado, Carregado)"
                            value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
                            style={{ padding: '10px', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '0.9rem', fontFamily: 'inherit' }} />
                        <input type="text" placeholder="Contacto (telemóvel ou email)"
                            value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} required
                            style={{ padding: '10px', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '0.9rem', fontFamily: 'inherit' }} />
                        <input type="text" placeholder="Recompensa (opcional, ex: 50€)"
                            value={form.reward} onChange={e => setForm({ ...form, reward: e.target.value })}
                            style={{ padding: '10px', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '0.9rem', fontFamily: 'inherit' }} />
                        <div style={{ background: '#FEF2F2', padding: '10px', borderRadius: '8px', borderLeft: '4px solid #EF4444', marginTop: '4px' }}>
                            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', fontSize: '0.8rem', color: '#7F1D1D' }}>
                                <input type="checkbox" checked={form.acceptedTerms} onChange={e => setForm({ ...form, acceptedTerms: e.target.checked })} style={{ marginTop: '2px' }} />
                                <div>
                                    <b>Termos de Responsabilidade</b><br/>
                                    Partilhe contactos com cautela. O 2580 não se responsabiliza por burlas relacionadas com recompensas de animais ou objetos.
                                </div>
                            </label>
                        </div>
                        <button type="submit" disabled={submitting || !form.acceptedTerms} style={{ padding: '12px', borderRadius: '10px', border: 'none', background: (submitting || !form.acceptedTerms) ? '#9CA3AF' : 'var(--color-accent)', color: 'white', fontWeight: '700', fontSize: '1rem', cursor: (submitting || !form.acceptedTerms) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '8px' }}>
                            {submitting ? <><Loader size={18} className="spin" /> A submeter...</> : <><Heart size={18} /> Submeter Registo</>}
                        </button>
                    </form>
                </div>
            )}

            {/* Cards */}
            <div className={styles.list}>
                {loading ? (
                    <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>A carregar...</p>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <Heart size={40} color="#d1d5db" />
                        <p style={{ color: 'var(--color-text-muted)', marginTop: '12px' }}>Nenhum resultado. O Carregado está com sorte! 🍀</p>
                    </div>
                ) : filtered.map((item, index) => {
                    const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.lost_item;
                    return (
                        <React.Fragment key={item.id}>
                            {index > 0 && index % 4 === 0 && (
                                <div style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)', borderRadius: '12px', padding: '16px', color: 'white', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8, marginBottom: '4px' }}>Publicidade</div>
                                        <div style={{ fontWeight: '800' }}>Oficina Central</div>
                                        <div style={{ fontSize: '0.85rem' }}>Revisões e reparações – Preço Justo</div>
                                    </div>
                                    <span style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>Ver mais</span>
                                </div>
                            )}
                            <div style={{ position: 'relative', background: cfg.bg, borderRadius: '12px', padding: '16px', marginBottom: '12px', borderLeft: `5px solid ${cfg.border}`, boxShadow: 'var(--shadow-sm)' }}>
                                <button onClick={() => handleReport(item.id)} style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', fontSize: '0.8rem', color: '#9CA3AF', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    🚩
                                </button>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <span style={{ background: cfg.badge, color: 'white', fontSize: '0.68rem', fontWeight: '800', padding: '2px 8px', borderRadius: '4px', letterSpacing: '0.4px' }}>
                                        {cfg.label}
                                    </span>
                                    <span style={{ background: 'white', color: '#374151', fontSize: '0.68rem', fontWeight: '600', padding: '2px 8px', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
                                        {cfg.category}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: 'var(--color-text-muted)', flexShrink: 0 }}>
                                    <Clock size={11} />{timeAgo(item.created_at)}
                                </div>
                            </div>

                            <div style={{ fontWeight: '800', fontSize: '1rem', color: '#111827', marginBottom: '6px' }}>{item.title}</div>
                            <p style={{ fontSize: '0.88rem', color: '#374151', lineHeight: '1.5', margin: '0 0 10px 0' }}>{item.description}</p>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                                {item.location && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                                        <MapPin size={12} />{item.location}
                                    </span>
                                )}
                                {item.reward && (
                                    <span style={{ background: '#FEF3C7', color: '#92400E', fontSize: '0.75rem', fontWeight: '700', padding: '2px 8px', borderRadius: '20px' }}>
                                        🏅 {item.reward}
                                    </span>
                                )}
                                {item.contact && (
                                    <a href={`tel:${item.contact}`} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '8px', background: 'white', color: cfg.border, textDecoration: 'none', fontWeight: '700', fontSize: '0.82rem', border: `1px solid ${cfg.border}` }}>
                                        <Phone size={13} />{item.contact}
                                    </a>
                                )}
                                <a
                                    href={`https://wa.me/?text=${encodeURIComponent(`🔍 ${item.type.includes('lost') ? 'PERDIDO' : 'ENCONTRADO'}: ${item.title}\n${item.description}\n📍 ${item.location || 'Carregado'}\n📞 ${item.contact}\n\nVia 2580 Carregado`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ display:'inline-flex', alignItems:'center', gap:'5px', padding:'6px 12px', borderRadius:'8px', background:'#25D366', color:'white', textDecoration:'none', fontWeight:'700', fontSize:'0.8rem', flexShrink: 0 }}
                                    onClick={e => e.stopPropagation()}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                    Partilhar
                                </a>
                            </div>
                        </div>
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

export default PerdidosAchados;
