import React, { useState } from 'react';
import { Camera, Send, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import styles from './Transport.module.css';

const Report = () => {
    const [desc, setDesc] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const { t } = useTranslation();

    const handleSubmit = (e) => {
        e.preventDefault();
        setTimeout(() => {
            setSubmitted(true);
            setDesc('');
        }, 1000);
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
                    style={{ marginTop: '1rem', background: 'transparent', border: 'none', color: 'var(--color-accent)', fontWeight: '600' }}
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
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e5e7eb', minHeight: '120px', fontSize: '1rem', fontFamily: 'inherit' }}
                    />
                </div>

                <button type="button" className={styles.card} style={{ borderLeft: 'none', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: '600', color: 'var(--color-text)' }}>
                    <Camera size={20} />
                    {t('attach_photo')}
                </button>

                <button type="button" className={styles.card} style={{ borderLeft: 'none', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: '600', color: 'var(--color-text)' }}>
                    <MapPin size={20} />
                    {t('add_location')}
                </button>

                <button
                    type="submit"
                    style={{
                        background: 'var(--color-accent)',
                        color: 'white',
                        border: 'none',
                        padding: '1rem',
                        borderRadius: '12px',
                        fontWeight: '700',
                        fontSize: '1.1rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        marginTop: '1rem',
                        boxShadow: 'var(--shadow-md)'
                    }}
                >
                    <Send size={20} />
                    {t('submit_report')}
                </button>
            </form>
        </div>
    );
};

export default Report;
