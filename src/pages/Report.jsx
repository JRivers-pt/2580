import React, { useState } from 'react';
import { Send, MapPin, Loader } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../services/supabase';
import styles from './Transport.module.css';

const Report = () => {
    const [desc, setDesc] = useState('');
    const [location, setLocation] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const { t } = useTranslation();

    const handleAddLocation = () => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setLocation(`${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`);
                },
                () => {
                    setLocation('Carregado (localização manual)');
                }
            );
        } else {
            setLocation('Carregado');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        if (!supabase) {
            // Fallback for dev without Supabase
            setTimeout(() => {
                setSubmitted(true);
                setDesc('');
                setLocation('');
                setSubmitting(false);
            }, 1000);
            return;
        }

        const { error: insertError } = await supabase
            .from('reports')
            .insert([{
                description: desc,
                location: location || null,
                status: 'Pending'
            }]);

        if (insertError) {
            console.error('Error submitting report:', insertError);
            setError(insertError.message);
            setSubmitting(false);
        } else {
            setSubmitted(true);
            setDesc('');
            setLocation('');
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
                <div style={{ backgroundColor: '#10B981', color: 'white', padding: '1rem', borderRadius: '50%', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                    <Send size={30} />
                </div>
                <h1>{t('report_sent')}</h1>
                <p style={{ color: 'var(--color-text-muted)' }}>{t('thank_you')}</p>
                <button
                    onClick={() => setSubmitted(false)}
                    style={{ marginTop: '1rem', background: 'transparent', border: 'none', color: 'var(--color-accent)', fontWeight: '600', cursor: 'pointer' }}
                >
                    {t('submit_another')}
                </button>
            </div>
        );
    }

    return (
        <div className="container">
            <div className={styles.header}>
                <h1 className={styles.title}>{t('report_title')}</h1>
                <p style={{ color: 'var(--color-text-muted)' }}>{t('report_subtitle')}</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className={styles.card}>
                    <label style={{ display: 'block', fontWeight: '700', marginBottom: '0.5rem' }}>{t('desc_label')}</label>
                    <textarea
                        value={desc}
                        onChange={(e) => setDesc(e.target.value)}
                        placeholder={t('desc_placeholder')}
                        required
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e5e7eb', minHeight: '120px', fontSize: '1rem', fontFamily: 'inherit', boxSizing: 'border-box' }}
                    />
                </div>

                <button
                    type="button"
                    className={styles.card}
                    onClick={handleAddLocation}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: '600', color: location ? 'var(--color-primary)' : 'var(--color-text)', cursor: 'pointer', borderLeft: location ? '4px solid var(--color-primary)' : undefined }}
                >
                    <MapPin size={20} />
                    {location || t('add_location')}
                </button>

                {error && (
                    <div style={{ background: '#FEF2F2', borderLeft: '4px solid #EF4444', padding: '12px', borderRadius: '4px', fontSize: '0.9rem', color: '#7F1D1D' }}>
                        Erro: {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={submitting}
                    style={{
                        background: submitting ? '#9CA3AF' : 'var(--color-accent)',
                        color: 'white',
                        border: 'none',
                        padding: '1rem',
                        borderRadius: '12px',
                        fontWeight: '700',
                        fontSize: '1.1rem',
                        cursor: submitting ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        marginTop: '1rem',
                        boxShadow: 'var(--shadow-md)'
                    }}
                >
                    {submitting ? <Loader size={20} className="spin" /> : <Send size={20} />}
                    {submitting ? 'A enviar...' : t('submit_report')}
                </button>
            </form>
        </div>
    );
};

export default Report;
