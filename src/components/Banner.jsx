import React, { useState, useEffect } from 'react';
import { ExternalLink, ChevronRight, ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import styles from './Banner.module.css';

const Banner = () => {
    const { t } = useTranslation();
    const [current, setCurrent] = useState(0);

    const ads = [
        {
            id: 1,
            label: t('local_partner'),
            title: 'Padaria Carregadense',
            text: 'O melhor pão da vila. Visite-nos na Rua 25 de Abril!',
            gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
        },
        {
            id: 2,
            label: t('auto_services'),
            title: 'Oficina Central',
            text: 'Revisão e pneus com 10% de desconto. Marca já!',
            gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)'
        },
        {
            id: 3,
            label: t('butcher'),
            title: 'Talho do Povo',
            text: 'Carnes frescas e nacionais. Qualidade garantida.',
            gradient: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)'
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % ads.length);
        }, 5000); // 5 seconds
        return () => clearInterval(timer);
    }, []);

    const ad = ads[current];

    return (
        <div className={styles.container} style={{ background: ad.gradient }}>
            <div className={styles.label}>{ad.label}</div>

            <div className={styles.content}>
                <div style={{ flex: 1 }}>
                    <h3 className={styles.title}>{ad.title}</h3>
                    <p className={styles.text}>{ad.text}</p>
                </div>
                <div className={styles.action}>
                    <ExternalLink size={20} color="white" />
                </div>
            </div>

            <div className={styles.dots}>
                {ads.map((_, idx) => (
                    <span
                        key={idx}
                        className={`${styles.dot} ${idx === current ? styles.activeDot : ''}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default Banner;
