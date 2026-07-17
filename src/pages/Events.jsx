import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, PlusCircle, X } from 'lucide-react';
import { supabase } from '../services/supabase';
import styles from './Transport.module.css';

const EVENT_TYPES = ['Todos', 'Festa', 'Mercado', 'Reunião', 'Desporto', 'Cultura', 'Outro'];

const TYPE_COLORS = {
    'Festa': '#EC4899', 'Mercado': '#F59E0B', 'Reunião': '#3B82F6',
    'Desporto': '#10B981', 'Cultura': '#8B5CF6', 'Outro': '#6B7280',
};

const mockEvents = [
    { id: 1, title: 'Festa da Aldeia do Carregado', type: 'Festa', date: '2026-08-15', time: '18:00', location: 'Largo Principal, Carregado', description: 'Festa anual com música ao vivo, comes e bebes.', organizer: 'Junta de Freguesia' },
    { id: 2, title: 'Mercado Mensal', type: 'Mercado', date: '2026-08-01', time: '09:00', location: 'Mercado Municipal', description: 'Produtos locais, artesanato e agricultura biológica.', organizer: 'Câmara de Alenquer' },
    { id: 3, title: 'Torneio de Futsal', type: 'Desporto', date: '2026-07-20', time: '10:00', location: 'Pavilhão Municipal', description: 'Torneio aberto a todas as idades. Inscrições no local.', organizer: 'Associação Desportiva' },
];

const Events = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('Todos');
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({ title: '', type: 'Outro', date: '', time: '', location: '', description: '', organizer: '' });

    useEffect(() => {
        async function fetchEvents() {
            setLoading(true);
            if (!supabase) { setEvents(mockEvents); setLoading(false); return; }
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .gte('date', new Date().toISOString().split('T')[0])
                .order('date', { ascending: true });
            setEvents(!error && data?.length ? data : mockEvents);
            setLoading(false);
        }
        fetchEvents();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        if (supabase) {
            const { data, error } = await supabase.from('events').insert([form]).select();
            if (!error && data) setEvents(prev => [...prev, data[0]].sort((a,b) => a.date.localeCompare(b.date)));
        } else {
            setEvents(prev => [...prev, { ...form, id: Date.now() }]);
        }
        setForm({ title: '', type: 'Outro', date: '', time: '', location: '', description: '', organizer: '' });
        setShowForm(false);
        setSubmitting(false);
    };

    const formatDate = (dateStr) => {
        try {
            return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-PT', { weekday: 'short', day: 'numeric', month: 'long' });
        } catch { return dateStr; }
    };

    const isPast = (dateStr) => new Date(dateStr + 'T23:59:59') < new Date();

    const displayed = events.filter(e => filter === 'Todos' || e.type === filter);

    const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '0.9rem', fontFamily: 'inherit', boxSizing: 'border-box', background: 'white' };

    return (
        <div className="container">
            <div className={styles.header}>
                <h1 className={styles.title}>📅 Eventos</h1>
                <p style={{ color: 'var(--color-text-muted)', margin: '4px 0 16px 0' }}>O que acontece no Carregado</p>
            </div>

            {/* Filter chips */}
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none', marginBottom: '14px' }}>
                {EVENT_TYPES.map(t => (
                    <button key={t} onClick={() => setFilter(t)} style={{ whiteSpace: 'nowrap', padding: '6px 14px', borderRadius: '20px', border: 'none', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', background: filter === t ? (TYPE_COLORS[t] || 'var(--color-primary)') : 'var(--color-surface)', color: filter === t ? 'white' : 'var(--color-text-muted)', transition: 'all 0.2s' }}>
                        {t}
                    </button>
                ))}
            </div>

            {/* Add event button */}
            <button onClick={() => setShowForm(!showForm)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '11px', borderRadius: '12px', border: '2px dashed var(--color-primary)', background: 'transparent', color: 'var(--color-primary)', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', marginBottom: '14px' }}>
                <PlusCircle size={18} /> {showForm ? 'Cancelar' : 'Sugerir Evento'}
            </button>

            {/* Form */}
            {showForm && (
                <div style={{ background: 'white', borderRadius: '16px', padding: '16px', marginBottom: '16px', boxShadow: 'var(--shadow-md)', border: '1px solid #e5e7eb' }}>
                    <h3 style={{ margin: '0 0 14px 0', fontSize: '1rem' }}>📝 Novo Evento</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <input style={inputStyle} placeholder="Nome do evento" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <select style={inputStyle} value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                                {EVENT_TYPES.filter(t => t !== 'Todos').map(t => <option key={t}>{t}</option>)}
                            </select>
                            <input style={inputStyle} type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <input style={inputStyle} type="time" value={form.time} onChange={e => setForm({...form, time: e.target.value})} />
                            <input style={inputStyle} placeholder="Organização" value={form.organizer} onChange={e => setForm({...form, organizer: e.target.value})} />
                        </div>
                        <input style={inputStyle} placeholder="Local (ex: Largo Principal)" value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
                        <textarea style={{...inputStyle, minHeight:'80px', resize:'vertical'}} placeholder="Descrição do evento" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                        <button type="submit" disabled={submitting} style={{ padding: '11px', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer' }}>
                            {submitting ? 'A publicar...' : '✅ Publicar Evento'}
                        </button>
                    </form>
                </div>
            )}

            {/* Events list */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>A carregar...</div>
            ) : displayed.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <Calendar size={40} color="#d1d5db" />
                    <p style={{ color: 'var(--color-text-muted)', marginTop: '12px' }}>Sem eventos nesta categoria.</p>
                </div>
            ) : displayed.map(event => {
                const past = isPast(event.date);
                const color = TYPE_COLORS[event.type] || '#6B7280';
                const waMsg = encodeURIComponent(`📅 ${event.title}\n🗓️ ${formatDate(event.date)} ${event.time ? '• ' + event.time : ''}\n📍 ${event.location || 'Carregado'}\n\nVia 2580 Carregado`);
                return (
                    <div key={event.id} style={{ background: past ? '#f9fafb' : 'white', borderRadius: '14px', padding: '14px 16px', marginBottom: '10px', boxShadow: 'var(--shadow-sm)', borderLeft: `5px solid ${past ? '#d1d5db' : color}`, border: `1px solid ${past ? '#f3f4f6' : '#f3f4f6'}`, borderLeft: `5px solid ${past ? '#d1d5db' : color}`, opacity: past ? 0.7 : 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                    <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'white', background: past ? '#9CA3AF' : color, padding: '2px 8px', borderRadius: '20px' }}>{event.type}</span>
                                    {past && <span style={{ fontSize: '0.68rem', color: '#9CA3AF', fontWeight: '600' }}>Já aconteceu</span>}
                                </div>
                                <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--color-text)', lineHeight: 1.3 }}>{event.title}</div>
                            </div>
                            <a href={`https://wa.me/?text=${waMsg}`} target="_blank" rel="noopener noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:'4px', padding:'5px 10px', borderRadius:'8px', background:'#25D366', color:'white', textDecoration:'none', fontWeight:'700', fontSize:'0.75rem', flexShrink:0, marginLeft:'8px' }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                Partilhar
                            </a>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '6px' }}>
                            <span style={{ display:'flex', alignItems:'center', gap:'4px' }}><Calendar size={12}/> {formatDate(event.date)}{event.time && ` • ${event.time}`}</span>
                            {event.location && <span style={{ display:'flex', alignItems:'center', gap:'4px' }}><MapPin size={12}/> {event.location}</span>}
                        </div>
                        {event.description && <p style={{ fontSize: '0.85rem', color: 'var(--color-text)', margin: '8px 0 0', lineHeight: 1.5 }}>{event.description}</p>}
                        {event.organizer && <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: '4px 0 0', fontWeight: '600' }}>🏛️ {event.organizer}</p>}
                    </div>
                );
            })}
        </div>
    );
};

export default Events;
