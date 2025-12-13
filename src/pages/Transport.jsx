import React, { useState } from 'react';
import { Bus, Train } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import styles from './Transport.module.css';
import { busRoutes, trainRoutes } from '../data/transportData';

const Transport = () => {
    const [activeTab, setActiveTab] = useState('bus');
    const { t } = useTranslation();

    return (
        <div className="container">
            <div className={styles.header}>
                <h1 className={styles.title}>{t('transport_title')}</h1>
                <p style={{ color: 'var(--color-text-muted)' }}>{t('transport_subtitle')}</p>
            </div>

            <div className={styles.controls}>
                <button
                    className={`${styles.tabBtn} ${activeTab === 'bus' ? styles.active : ''}`}
                    onClick={() => setActiveTab('bus')}
                >
                    <Bus size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                    {t('bus')}
                </button>
                <button
                    className={`${styles.tabBtn} ${activeTab === 'train' ? styles.active : ''}`}
                    onClick={() => setActiveTab('train')}
                >
                    <Train size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                    {t('train')}
                </button>
            </div>

            <div className={styles.list}>
                {activeTab === 'bus' ? (
                    busRoutes.map(route => (
                        <div key={route.id} className={styles.card}>
                            <div className={styles.operator}>{route.operator}</div>
                            <div className={styles.routeTitle}>{route.route}</div>
                            <div className={styles.times}>
                                {route.nextDepartures.map(time => (
                                    <span key={time} className={styles.timeBadge}>{time}</span>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    trainRoutes.map(route => (
                        <div key={route.id} className={styles.card} style={{ borderLeftColor: '#006400' }}>
                            <div className={styles.operator}>{route.operator}</div>
                            <div className={styles.routeTitle}>{route.route}</div>
                            <div className={styles.times}>
                                {route.nextDepartures.map(time => (
                                    <span key={time} className={styles.timeBadge}>{time}</span>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Transport;
