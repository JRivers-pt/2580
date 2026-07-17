import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../services/supabase';
import styles from './Transport.module.css';

const mockNews = [
    {
        id: 1,
        title: 'Bem-vindo ao 2580!',
        body: 'A plataforma comunitária do Carregado está online. Fique atento às novidades.',
        created_at: new Date().toISOString(),
        author: 'Equipa 2580'
    }
];

const News = () => {
    const [newsItems, setNewsItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation();

    useEffect(() => {
        async function fetchNews() {
            setLoading(true);
            if (!supabase) {
                setNewsItems(mockNews);
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('news')
                .select('*')
                .order('created_at', { ascending: false });

            if (error || !data) {
                console.error('Error fetching news:', error);
                setNewsItems(mockNews);
            } else {
                setNewsItems(data);
            }
            setLoading(false);
        }

        fetchNews();
    }, []);

    const formatDate = (dateStr) => {
        try {
            return new Date(dateStr).toLocaleDateString('pt-PT', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="container">
            <div className={styles.header}>
                <h1 className={styles.title}>{t('news_title')}</h1>
                <p style={{ color: 'var(--color-text-muted)' }}>{t('news_subtitle')}</p>
            </div>

            <div className={styles.list}>
                {loading ? (
                    <p>Loading...</p>
                ) : newsItems.length === 0 ? (
                    <div className={styles.card}>
                        <p style={{ color: 'var(--color-text-muted)', textAlign: 'center' }}>
                            {t('no_news') || 'Sem notícias de momento.'}
                        </p>
                    </div>
                ) : (
                    newsItems.map(item => (
                        <div key={item.id} className={styles.card} style={{ borderLeftColor: 'var(--color-primary)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                                <Calendar size={14} />
                                <span>{formatDate(item.created_at)}</span>
                                {item.author && (
                                    <span style={{ marginLeft: 'auto', background: '#DBEAFE', color: '#1E40AF', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '700' }}>
                                        {item.author}
                                    </span>
                                )}
                            </div>
                            <div className={styles.routeTitle} style={{ fontSize: '1.2rem' }}>{item.title}</div>
                            <p style={{ color: 'var(--color-text)', lineHeight: '1.5', margin: '0.5rem 0 0 0' }}>{item.body}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default News;
