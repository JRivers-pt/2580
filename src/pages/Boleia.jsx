import React, { useState, useEffect } from 'react';
import { Car, Clock, Users, MapPin, PlusCircle, ArrowRight, Loader } from 'lucide-react';
import { supabase } from '../services/supabase';
import styles from './Transport.module.css';

const mockRides = [
    {
        id: 1,
        origin: 'Carregado (Estação)',
        destination: 'Lisboa (Oriente)',
        date: new Date(Date.now() + 3600000 * 16).toISOString(),
        time: '07:15',
        seats: 2,
        contact: '9XX XXX XXX',
        notes: 'Saio de casa às 7h00. Partilha de gasóleo.',
        recurring: true,
        created_at: new Date().toISOString(),
    },
    {
        id: 2,
        origin: 'Azambuja',
        destination: 'Carregado (Lidl)',
        date: new Date(Date.now() + 3600000 * 2).toISOString(),
        time: '09:00',
        seats: 3,
        contact: '9XX XXX XXX',
        notes: 'Ida e volta. Retorno às 11h.',
        recurring: false,
        created_at: new Date(Date.now() - 3600000).toISOString(),
    },
];

const Boleia = () => {
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [filter, setFilter] = useState('all'); // all | to_lisbon | to_carregado | local
    const [form, setForm] = useState({
        origin: '',
        destination: '',
        date: '',
        time: '',
        seats: 1,
        contact: '',
        notes: '',
        recurring: false,
    });

    useEffect(() => { fetchRides(); }, []);

    async function fetchRides() {
        setLoading(true);
        if (!supabase) { setRides(mockRides); setLoading(false); return; }
        const { data, error } = await supabase
            .from('boleia')
            .select('*')
            .gte('date', new Date().toISOString().split('T')[0])
            .order('date', { ascending: true })
            .order('time', { ascending: true });
        setRides((!error && data?.length > 0) ? data : mockRides);
        setLoading(false);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        if (!supabase) {
            setTimeout(() => {
                setRides(prev => [{ ...form, id: Date.now(), created_at: new Date().toISOString() }, ...prev]);
                setForm({ origin: '', destination: '', date: '', time: '', seats: 1, contact: '', notes: '', recurring: false });
                setShowForm(false); setSubmitted(true); setSubmitting(false);
            }, 800);
            return;
        }
        const { error } = await supabase.from('boleia').insert([form]);
        if (!error) { await fetchRides(); setShowForm(false); setSubmitted(true); setForm({ origin: '', destination: '', date: '', time: '', seats: 1, contact: '', notes: '', recurring: false }); }
        setSubmitting(false);
    };

    const filtered = rides.filter(r => {
        if (filter === 'to_lisbon') return r.destination?.toLowerCase().includes('lisboa') || r.destination?.toLowerCase().includes('sintra') || r.destination?.toLowerCase().includes('loures');
        if (filter === 'to_carregado') return r.destination?.toLowerCase().includes('carregado') || r.destination?.toLowerCase().includes('alenquer');
        if (filter === 'local') return !r.destination?.toLowerCase().includes('lisboa');
        return true;
    });

    const formatDate = (dateStr, time) => {
        const d = new Date(dateStr);
        const today = new Date();
        const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
        const label = d.toDateString() === today.toDateString() ? 'Hoje' :
            d.toDateString() === tomorrow.toDateString() ? 'Amanhã' :
            d.toLocaleDateString('pt-PT', { weekday: 'short', day: 'numeric', month: 'short' });
        return `${label} ${time ? `às ${time}` : ''}`;
    };

    return (
        <div className="container">
            <div className={styles.header}>
                <h1 className={styles.title}>🚗 Boleia</h1>
                <p style={{ color: 'var(--color-text-muted)', margin: '4px 0 16px 0' }}>
                    Partilha de viagem no Carregado e arredores
                </p>

                {/* Filters */}
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
                    {[
                        { key: 'all', label: '🚗 Todas' },
                        { key: 'to_lisbon', label: '🏙️ → Lisboa' },
                        { key: 'to_carregado', label: '🏘️ → Carregado' },
                        { key: 'local', label: '📍 Local' },
                    ].map(f => (
                        <button key={f.key} onClick={() => setFilter(f.key)} style={{
                            whiteSpace: 'nowrap', padding: '6px 14px', borderRadius: '20px',
                            border: 'none', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer',
                            background: filter === f.key ? 'var(--color-primary)' : 'var(--color-surface)',
                            color: filter === f.key ? 'white' : 'var(--color-text-muted)',
                        }}>{f.label}</button>
                    ))}
                </div>
            </div>

            {/* Post ride button */}
            <button onClick={() => setShowForm(!showForm)} style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '8px', padding: '12px', borderRadius: '10px', marginBottom: '16px',
                background: showForm ? '#f3f4f6' : 'var(--color-primary)', color: showForm ? 'var(--color-text)' : 'white',
                fontWeight: '700', fontSize: '0.95rem', border: 'none', cursor: 'pointer',
                boxShadow: showForm ? 'none' : 'var(--shadow-md)', transition: 'all 0.2s',
            }}>
                <PlusCircle size={18} />
                {showForm ? 'Cancelar' : 'Oferecer Boleia'}
            </button>

            {/* Form */}
            {showForm && (
                <div style={{ background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '16px', boxShadow: 'var(--shadow-md)', border: '1px solid #e5e7eb' }}>
                    <h3 style={{ margin: '0 0 16px 0' }}>Nova Boleia</h3>
                    {submitted && <div style={{ background: '#ECFDF5', borderLeft: '4px solid #10B981', padding: '10px', borderRadius: '6px', marginBottom: '12px', fontSize: '0.9rem', color: '#065F46' }}>✅ Boleia publicada!</div>}
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <input placeholder="Origem (ex: Carregado)" value={form.origin} onChange={e => setForm({ ...form, origin: e.target.value })} required style={{ padding: '10px', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '0.9rem', fontFamily: 'inherit' }} />
                            <input placeholder="Destino (ex: Lisboa)" value={form.destination} onChange={e => setForm({ ...form, destination: e.target.value })} required style={{ padding: '10px', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '0.9rem', fontFamily: 'inherit' }} />
                            <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required min={new Date().toISOString().split('T')[0]} style={{ padding: '10px', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '0.9rem', fontFamily: 'inherit' }} />
                            <input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} required style={{ padding: '10px', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '0.9rem', fontFamily: 'inherit' }} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '4px' }}>Lugares disponíveis</label>
                                <select value={form.seats} onChange={e => setForm({ ...form, seats: parseInt(e.target.value) })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '0.9rem', fontFamily: 'inherit' }}>
                                    {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} lugar{n > 1 ? 'es' : ''}</option>)}
                                </select>
                            </div>
                            <input placeholder="Contacto (telemóvel)" value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} required style={{ padding: '10px', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '0.9rem', fontFamily: 'inherit', alignSelf: 'end' }} />
                        </div>
                        <textarea placeholder="Notas (ex: partilha de gasóleo, horário flexível...)" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '0.9rem', fontFamily: 'inherit', minHeight: '70px' }} />
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem' }}>
                            <input type="checkbox" checked={form.recurring} onChange={e => setForm({ ...form, recurring: e.target.checked })} />
                            Viagem recorrente (diária/semanal)
                        </label>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>
                            ⚠️ O 2580 não se responsabiliza pelas boleias. Combinações são entre os utilizadores.
                        </p>
                        <button type="submit" disabled={submitting} style={{ padding: '12px', borderRadius: '10px', border: 'none', background: submitting ? '#9CA3AF' : 'var(--color-primary)', color: 'white', fontWeight: '700', fontSize: '1rem', cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            {submitting ? <><Loader size={18} className="spin" /> A publicar...</> : <><Car size={18} /> Publicar Boleia</>}
                        </button>
                    </form>
                </div>
            )}

            {/* Ride cards */}
            <div className={styles.list}>
                {loading ? (
                    <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>A carregar...</p>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                        <Car size={40} color="#d1d5db" />
                        <p style={{ color: 'var(--color-text-muted)', marginTop: '12px' }}>Sem boleias disponíveis. Seja o primeiro!</p>
                    </div>
                ) : filtered.map(ride => (
                    <div key={ride.id} style={{ background: 'white', borderRadius: '12px', padding: '16px', boxShadow: 'var(--shadow-sm)', borderLeft: '5px solid var(--color-primary)', border: '1px solid #f3f4f6', borderLeft: '5px solid var(--color-primary)' }}>
                        {/* Route */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                            <span style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--color-text)' }}>{ride.origin}</span>
                            <ArrowRight size={16} color="var(--color-primary)" />
                            <span style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--color-text)' }}>{ride.destination}</span>
                            {ride.recurring && <span style={{ marginLeft: 'auto', background: '#DBEAFE', color: '#1E40AF', fontSize: '0.68rem', fontWeight: '700', padding: '2px 8px', borderRadius: '20px' }}>🔁 Recorrente</span>}
                        </div>

                        {/* Meta */}
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                                <Clock size={14} color="var(--color-primary)" />
                                <span style={{ fontWeight: '600', color: 'var(--color-text)' }}>{formatDate(ride.date, ride.time)}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                                <Users size={14} color="var(--color-secondary)" />
                                <span>{ride.seats} lugar{ride.seats > 1 ? 'es' : ''}</span>
                            </div>
                        </div>

                        {ride.notes && (
                            <p style={{ fontSize: '0.88rem', color: '#555', margin: '10px 0 10px 0', lineHeight: '1.4', borderTop: '1px solid #f3f4f6', paddingTop: '10px' }}>
                                {ride.notes}
                            </p>
                        )}

                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                            <a href={`tel:${ride.contact}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', background: '#ECFDF5', color: '#10B981', textDecoration: 'none', fontWeight: '700', fontSize: '0.85rem' }}>
                                📞 {ride.contact}
                            </a>
                            <a
                                href={`https://wa.me/?text=${encodeURIComponent(`🚗 Boleia disponível!\n${ride.origin} → ${ride.destination}\n📅 ${ride.date} ${ride.time}\n💺 ${ride.seats} lugar(es)\n📞 ${ride.contact}\n\nVia 2580 Carregado`)}`}
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
                ))}
            </div>
        </div>
    );
};

export default Boleia;
