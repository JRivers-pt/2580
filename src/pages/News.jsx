import React from 'react';
import { Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import styles from './Transport.module.css';

const newsItems = [
    {
        id: 1,
        title: 'Festas do Carregado 2025',
        date: '12 Aug 2025',
        content: 'The annual festivities are coming! Prepare for 5 days of music and food.',
        important: true
    },
    {
        id: 2,
        title: 'Roadworks on N1',
        date: '10 Aug 2025',
        content: 'Traffic delays expected near the roundabout due to resurfacing.',
        important: false
    },
    {
        id: 3,
        title: 'New Library Hours',
        date: '01 Aug 2025',
        content: 'The local library will now be open regarding Saturdays.',
        important: false
    }
];

const News = () => {
    const { t } = useTranslation();

    return (
        <div className="container">
            <div className={styles.header}>
                <h1 className={styles.title}>{t('news_title')}</h1>
                <p style={{ color: 'var(--color-text-muted)' }}>{t('news_subtitle')}</p>
            </div>

            <div className={styles.list}>
                {newsItems.map(item => (
                    <div key={item.id} className={styles.card} style={{ borderLeftColor: item.important ? 'var(--color-accent)' : '#9ca3af' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                            <Calendar size={14} />
                            <span>{item.date}</span>
                            {item.important && <span style={{ background: '#FECACA', color: '#991B1B', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '700', marginLeft: 'auto' }}>IMPORTANT</span>}
                        </div>
                        <div className={styles.routeTitle} style={{ fontSize: '1.2rem' }}>{item.title}</div>
                        <p style={{ color: 'var(--color-text)', lineHeight: '1.5', margin: '0.5rem 0 0 0' }}>{item.content}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default News;
