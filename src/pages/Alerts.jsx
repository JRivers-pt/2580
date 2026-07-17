import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldAlert, Info, Zap, PlusCircle, ChevronDown, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../services/supabase';
import styles from './Transport.module.css';

const ALERT_TYPES = [
    { key: 'all', label: 'Todos', icon: null, color: '#6B7280' },
    { key: 'urgent', label: '🚨 Urgente', icon: Zap, color: '#EF4444' },
    { key: 'scam', label: '⚠️ Burla', icon: AlertTriangle, color: '#F59E0B' },
    { key: 'safety', label: '🛡️ Segurança', icon: ShieldAlert, color: '#3B82F6' },
    { key: 'info', label: 'ℹ️ Info', icon: Info, color: '#10B981' },
];

const TYPE_CONFIG = {
    urgent: { label: '🚨 URGENTE', bg: '#FEF2F2', border: '#EF4444', badge: '#EF4444', text: '#991B1B' },
    scam:   { label: '⚠️ BURLA', bg: '#FFFBEB', border: '#F59E0B', badge: '#F59E0B', text: '#92400E' },
    safety: { label: '🛡️ SEGURANÇA', bg: '#EFF6FF', border: '#3B82F6', badge: '#3B82F6', text: '#1E40AF' },
    info:   { label: 'ℹ️ INFO', bg: '#F0FDF4', border: '#10B981', badge: '#10B981', text: '#065F46' },
};

const mockAlerts = [
    {
        id: 1,
        type: 'scam',
        title: 'Burla por telefone — fingem ser da EDP',
        body: 'Estão a ligar a dizer que a conta vai ser cortada e a pedir pagamento urgente por MB Way. A EDP nunca pede pagamentos desta forma. Não pague!',
        location: 'Carregado',
        author: 'Comunidade',
        created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
        is_verified: true,
    },
    {
        id: 2,
        type: 'safety',
        title: 'Carro suspeito junto à escola',
        body: 'Foi avistado um veículo a circular lentamente junto à escola primária. Se observarem situações suspeitas contactem as autoridades: 112.',
        location: 'Escola Primária',
        author: 'Comunidade',
        created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
        is_verified: false,
    },
];

const Alerts = () => {
    const [alerts, setAlerts] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [activeType, setActiveType] = useState('all');
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ type: 'scam', title: '', body: '', location: '' });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        fetchAlerts();
    }, []);

    async function fetchAlerts() {
        setLoading(true);
        if (!supabase) {
            setAlerts(mockAlerts);
            setLoading(false);
            return;
        }
        const { data, error } = await supabase
            .from('alerts')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (error || !data) {
            setAlerts(mockAlerts);
        } else {
            setAlerts(data.length > 0 ? data : mockAlerts);
        }
        setLoading(false);
    }

    useEffect(() => {
        if (activeType === 'all') {
            setFiltered(alerts);
        } else {
            setFiltered(alerts.filter(a => a.type === activeType));
        }
    }, [alerts, activeType]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        if (!supabase) {
            setTimeout(() => {
                setAlerts(prev => [{ ...form, id: Date.now(), created_at: new Date().toISOString(), author: 'Comunidade', is_verified: false }, ...prev]);
                setForm({ type: 'scam', title: '', body: '', location: '' });
                setShowForm(false);
                setSubmitted(true);
                setSubmitting(false);
            }, 800);
            return;
        }

        const { error } = await supabase.from('alerts').insert([{
            ...form,
            author: 'Comunidade',
            is_verified: false,
            is_active: true,
        }]);

        if (!error) {
            await fetchAlerts();
            setForm({ type: 'scam', title: '', body: '', location: '' });
            setShowForm(false);
            setSubmitted(true);
        }
        setSubmitting(false);
    };

    const timeAgo = (dateStr) => {
        const diff = (Date.now() - new Date(dateStr)) / 1000;
        if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
        return `${Math.floor(diff / 86400)}d atrás`;
    };

    return (
        <div className="container">
            {/* Header */}
            <div className={styles.header}>
                <h1 className={styles.title}>🛡️ Alertas & Burlas</h1>
                <p style={{ color: 'var(--color-text-muted)', margin: '4px 0 16px 0' }}>
                    Informação da comunidade para a comunidade
                </p>

                {/* Safety info banner */}
                <div style={{
                    background: '#FEF2F2', borderLeft: '4px solid #EF4444',
                    padding: '12px', borderRadius: '8px', marginBottom: '16px',
                    fontSize: '0.85rem', color: '#7F1D1D'
                }}>
                    <strong>⚠️ Emergência?</strong> Ligue <a href="tel:112" style={{ color: '#EF4444', fontWeight: '700' }}>112</a> &nbsp;|&nbsp;
                    <strong>GNR Carregado:</strong> <a href="tel:263850410" style={{ color: '#EF4444', fontWeight: '700' }}>263 850 410</a>
                </div>

                {/* Type filters */}
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none', marginBottom: '4px' }}>
                    {ALERT_TYPES.map(type => (
                        <button
                            key={type.key}
                            onClick={() => setActiveType(type.key)}
                            style={{
                                whiteSpace: 'nowrap', padding: '6px 14px',
                                borderRadius: '20px', border: 'none', fontSize: '0.82rem',
                                fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s',
                                background: activeType === type.key ? type.color : 'var(--color-surface)',
                                color: activeType === type.key ? 'white' : 'var(--color-text-muted)',
                            }}
                        >
                            {type.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Submit alert button */}
            <button
                onClick={() => setShowForm(!showForm)}
                style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: '8px', padding: '12px', borderRadius: '10px', marginBottom: '16px',
                    background: showForm ? '#f3f4f6' : 'var(--color-accent)', color: showForm ? 'var(--color-text)' : 'white',
                    fontWeight: '700', fontSize: '0.95rem', border: 'none', cursor: 'pointer',
                    boxShadow: showForm ? 'none' : 'var(--shadow-md)', transition: 'all 0.2s'
                }}
            >
                <PlusCircle size={18} />
                {showForm ? 'Cancelar' : 'Reportar Burla ou Alerta'}
            </button>

            {/* Submission form */}
            {showForm && (
                <div style={{
                    background: 'white', borderRadius: '12px', padding: '20px',
                    marginBottom: '16px', boxShadow: 'var(--shadow-md)', border: '1px solid #e5e7eb'
                }}>
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem' }}>Novo Alerta</h3>
                    {submitted && (
                        <div style={{ background: '#ECFDF5', borderLeft: '4px solid #10B981', padding: '10px', borderRadius: '6px', marginBottom: '12px', fontSize: '0.9rem', color: '#065F46' }}>
                            ✅ Alerta submetido! Obrigado por ajudar a comunidade.
                        </div>
                    )}
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <select
                            value={form.type}
                            onChange={e => setForm({ ...form, type: e.target.value })}
                            style={{ padding: '10px', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '0.95rem', fontFamily: 'inherit' }}
                        >
                            <option value="scam">⚠️ Burla / Fraude</option>
                            <option value="safety">🛡️ Segurança</option>
                            <option value="urgent">🚨 Urgente</option>
                            <option value="info">ℹ️ Informação</option>
                        </select>
                        <input
                            type="text"
                            placeholder="Título do alerta (ex: Burla por telefone)"
                            value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                            required
                            style={{ padding: '10px', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '0.95rem', fontFamily: 'inherit' }}
                        />
                        <textarea
                            placeholder="Descreva o alerta com o máximo de detalhe possível..."
                            value={form.body}
                            onChange={e => setForm({ ...form, body: e.target.value })}
                            required
                            style={{ padding: '10px', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '0.95rem', fontFamily: 'inherit', minHeight: '100px' }}
                        />
                        <input
                            type="text"
                            placeholder="Localização (opcional, ex: Rua 25 de Abril)"
                            value={form.location}
                            onChange={e => setForm({ ...form, location: e.target.value })}
                            style={{ padding: '10px', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '0.95rem', fontFamily: 'inherit' }}
                        />
                        <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: 0 }}>
                            ⚠️ Alertas falsos ou maliciosos serão removidos. Por favor seja responsável.
                        </p>
                        <button
                            type="submit"
                            disabled={submitting}
                            style={{
                                padding: '12px', borderRadius: '10px', border: 'none',
                                background: submitting ? '#9CA3AF' : '#EF4444', color: 'white',
                                fontWeight: '700', fontSize: '1rem', cursor: submitting ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {submitting ? 'A enviar...' : 'Submeter Alerta'}
                        </button>
                    </form>
                </div>
            )}

            {/* Alert cards */}
            <div className={styles.list}>
                {loading ? (
                    <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>A carregar...</p>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                        <ShieldAlert size={40} color="#d1d5db" />
                        <p style={{ color: 'var(--color-text-muted)', marginTop: '12px' }}>
                            Sem alertas nesta categoria. O Carregado está seguro! 🟢
                        </p>
                    </div>
                ) : (
                    filtered.map(alert => {
                        const cfg = TYPE_CONFIG[alert.type] || TYPE_CONFIG.info;
                        return (
                            <div key={alert.id} style={{
                                background: cfg.bg, borderRadius: '12px', padding: '16px',
                                borderLeft: `5px solid ${cfg.border}`, boxShadow: 'var(--shadow-sm)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{
                                            background: cfg.badge, color: 'white',
                                            fontSize: '0.68rem', fontWeight: '800', padding: '2px 8px',
                                            borderRadius: '4px', letterSpacing: '0.5px'
                                        }}>
                                            {cfg.label}
                                        </span>
                                        {alert.is_verified && (
                                            <span style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: '700' }}>
                                                ✓ Verificado
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                        <Clock size={12} />
                                        {timeAgo(alert.created_at)}
                                    </div>
                                </div>
                                <div style={{ fontWeight: '800', fontSize: '1rem', color: cfg.text, marginBottom: '6px' }}>
                                    {alert.title}
                                </div>
                                <p style={{ fontSize: '0.9rem', color: 'var(--color-text)', lineHeight: '1.55', margin: '0 0 8px 0' }}>
                                    {alert.body}
                                </p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                                    {alert.location && <span>📍 {alert.location}</span>}
                                    <span>{alert.author}</span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default Alerts;
