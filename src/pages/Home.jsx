import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Bus, Briefcase, Home as HomeIcon, Map as MapIcon, Megaphone } from 'lucide-react';
import Banner from '../components/Banner';
import { supabase } from '../services/supabase';
import styles from './Home.module.css';

const Home = () => {
    const { t } = useTranslation();
    const [news, setNews] = useState([]);

    useEffect(() => {
        if (!supabase) return;
        supabase.from('news')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(3)
            .then(({ data }) => setNews(data || []));
    }, []);

    return (
        <div className="container">
            <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>
                <span style={{ color: 'var(--color-primary)' }}>2580</span> Carregado
            </h1>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px' }}>{t('greeting')}</p>

            {news.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Megaphone size={20} /> Junta News
                    </h3>
                    {news.map(item => (
                        <div key={item.id} style={{ background: 'white', padding: '12px', borderRadius: '8px', marginBottom: '8px', borderLeft: '4px solid var(--color-primary)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <div style={{ fontWeight: 'bold' }}>{item.title}</div>
                            <p style={{ fontSize: '0.9rem', color: '#555', margin: '4px 0 0 0' }}>{item.body}</p>
                            <small style={{ color: '#999', fontSize: '0.8rem' }}>{new Date(item.created_at).toLocaleDateString()}</small>
                        </div>
                    ))}
                </div>
            )}

            <Banner />

            <div className={styles.grid}>
                <Link to="/transport" className={`${styles.card} ${styles.cardPrimary}`}>
                    <Bus className={styles.cardIcon} size={28} />
                    <div>
                        <div className={styles.cardTitle}>{t('transport')}</div>
                        <div className={styles.cardDesc}>{t('transport_desc')}</div>
                    </div>
                </Link>

                <Link to="/jobs" className={`${styles.card} ${styles.cardSecondary}`}>
                    <Briefcase className={styles.cardIcon} size={28} />
                    <div>
                        <div className={styles.cardTitle}>{t('jobs')}</div>
                        <div className={styles.cardDesc}>{t('jobs_desc')}</div>
                    </div>
                </Link>

                <Link to="/housing" className={`${styles.card} ${styles.cardAccent}`}>
                    <HomeIcon className={styles.cardIcon} size={28} />
                    <div>
                        <div className={styles.cardTitle}>{t('housing')}</div>
                        <div className={styles.cardDesc}>{t('housing_desc')}</div>
                    </div>
                </Link>

                <Link to="/map" className={`${styles.card} ${styles.cardMap}`}>
                    <MapIcon className={styles.cardIcon} size={28} />
                    <div>
                        <div className={styles.cardTitle}>{t('map')}</div>
                        <div className={styles.cardDesc}>Explore services</div>
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default Home;
