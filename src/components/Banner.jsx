import React, { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../services/supabase';
import styles from './Banner.module.css';

const FALLBACK_ADS = [
    {
        id: 1,
        title: 'Padaria Carregadense',
        description: 'Pão fresco todos os dias — Rua Vaz Monteiro, 107, Carregado',
        gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
        link_url: null,
        label: 'Parceiro Local',
    },
    {
        id: 2,
        title: 'Oficina Central',
        description: 'Revisão e pneus com 10% de desconto. Marca já!',
        gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
        link_url: null,
        label: 'Serviços Auto',
    },
    {
        id: 3,
        title: 'O seu negócio aqui! 🚀',
        description: 'Anuncie no 2580 e chegue a toda a comunidade do Carregado. Clique para saber mais.',
        gradient: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
        link_url: 'mailto:anuncie@2580carregado.pt?subject=Quero anunciar no 2580',
        label: '📣 Publicidade',
    },
];

const Banner = () => {
    const { t } = useTranslation();
    const [ads, setAds] = useState(FALLBACK_ADS);
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        async function fetchAds() {
            if (!supabase) return;
            const { data, error } = await supabase
                .from('ads')
                .select('*')
                .eq('is_active', true)
                .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString());

            if (!error && data && data.length > 0) {
                setAds(data);
                setCurrent(0);
            }
        }
        fetchAds();
    }, []);

    useEffect(() => {
        if (ads.length <= 1) return;
        const timer = setInterval(() => {
            setCurrent(prev => (prev + 1) % ads.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [ads.length]);

    const ad = ads[current];
    const content = (
        <div className={styles.container} style={{ background: ad.gradient, cursor: ad.link_url ? 'pointer' : 'default' }}>
            <div className={styles.label}>{ad.label || t('local_partner')}</div>
            <div className={styles.content}>
                <div style={{ flex: 1 }}>
                    <h3 className={styles.title}>{ad.title}</h3>
                    <p className={styles.text}>{ad.description}</p>
                </div>
                {ad.link_url && (
                    <div className={styles.action}>
                        <ExternalLink size={20} color="white" />
                    </div>
                )}
            </div>
            {ads.length > 1 && (
                <div className={styles.dots}>
                    {ads.map((_, idx) => (
                        <span
                            key={idx}
                            onClick={(e) => { e.preventDefault(); setCurrent(idx); }}
                            className={`${styles.dot} ${idx === current ? styles.activeDot : ''}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );

    if (ad.link_url) {
        return <a href={ad.link_url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>{content}</a>;
    }
    return content;
};

export default Banner;
