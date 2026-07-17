import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Bus, Briefcase, Home as HomeIcon, Map as MapIcon, Megaphone } from 'lucide-react';
import Banner from '../components/Banner';
import { supabase } from '../services/supabase';
import styles from './Home.module.css';

// ── Weather Widget ──────────────────────────────────────────────
const WeatherWidget = () => {
    const [weather, setWeather] = React.useState(null);
    React.useEffect(() => {
        fetch('https://api.open-meteo.com/v1/forecast?latitude=39.025&longitude=-8.987&current=temperature_2m,weathercode,windspeed_10m&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=Europe%2FLisbon&forecast_days=3')
            .then(r => r.json())
            .then(d => setWeather(d))
            .catch(() => {});
    }, []);

    const weatherIcon = (code) => {
        if (code === 0) return '☀️';
        if (code <= 2) return '⛅';
        if (code <= 48) return '☁️';
        if (code <= 67) return '🌧️';
        if (code <= 77) return '❄️';
        if (code <= 82) return '🌦️';
        return '⛈️';
    };

    const dayName = (i) => {
        const days = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
        const d = new Date();
        d.setDate(d.getDate() + i);
        return i === 0 ? 'Hoje' : i === 1 ? 'Amanhã' : days[d.getDay()];
    };

    if (!weather) return null;
    const c = weather.current;
    const d = weather.daily;

    return (
        <div style={{ background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)', borderRadius: '16px', padding: '16px', marginBottom: '12px', color: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: '600', opacity: 0.85, textTransform: 'uppercase', letterSpacing: '0.5px' }}>📍 Carregado</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <span style={{ fontSize: '2.5rem', lineHeight: 1 }}>{weatherIcon(c.weathercode)}</span>
                        <span style={{ fontSize: '2.2rem', fontWeight: '800' }}>{Math.round(c.temperature_2m)}°</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', opacity: 0.85, marginTop: '2px' }}>💨 {Math.round(c.windspeed_10m)} km/h</div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {[0,1,2].map(i => (
                        <div key={i} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.15)', borderRadius: '10px', padding: '8px 10px' }}>
                            <div style={{ fontSize: '0.65rem', fontWeight: '700', opacity: 0.9 }}>{dayName(i)}</div>
                            <div style={{ fontSize: '1.1rem', margin: '3px 0' }}>{weatherIcon(d.weathercode[i])}</div>
                            <div style={{ fontSize: '0.7rem', fontWeight: '700' }}>{Math.round(d.temperature_2m_max[i])}°</div>
                            <div style={{ fontSize: '0.65rem', opacity: 0.75 }}>{Math.round(d.temperature_2m_min[i])}°</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ── Emergency Contacts Widget ────────────────────────────────────
const EmergencyWidget = () => {
    const [open, setOpen] = React.useState(false);
    const contacts = [
        { icon: '🚔', name: 'GNR Carregado', phone: '263 856 120' },
        { icon: '🚑', name: 'INEM (Emergência)', phone: '112' },
        { icon: '🔥', name: 'Bombeiros Alenquer', phone: '263 712 122' },
        { icon: '🏥', name: 'Centro de Saúde', phone: '263 856 130' },
        { icon: '💊', name: 'Farmácia Carregado', phone: '263 856 065' },
        { icon: '🏛️', name: 'Câmara Alenquer', phone: '263 710 000' },
    ];
    return (
        <div style={{ background: 'white', borderRadius: '14px', marginBottom: '12px', boxShadow: 'var(--shadow-sm)', overflow: 'hidden', border: '1px solid #fee2e2' }}>
            <button onClick={() => setOpen(!open)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 16px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                <span style={{ fontWeight: '700', fontSize: '0.95rem', color: '#DC2626', display: 'flex', alignItems: 'center', gap: '8px' }}>🚨 Contactos de Emergência</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: '600' }}>{open ? '▲ Fechar' : '▼ Ver todos'}</span>
            </button>
            {open && (
                <div style={{ borderTop: '1px solid #fee2e2', padding: '8px 12px 12px' }}>
                    {contacts.map((c, i) => (
                        <a key={i} href={`tel:${c.phone.replace(/\s/g,'')}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 8px', borderRadius: '8px', textDecoration: 'none', color: 'var(--color-text)', transition: 'background 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.background='#fef2f2'}
                            onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '600', fontSize: '0.88rem' }}>
                                <span style={{ fontSize: '1.2rem' }}>{c.icon}</span>{c.name}
                            </span>
                            <span style={{ fontWeight: '700', color: '#DC2626', fontSize: '0.85rem' }}>{c.phone}</span>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
};

// ── Activity Counter Widget ──────────────────────────────────────
const ActivityCounter = () => {
    const [counts, setCounts] = React.useState({ businesses: 0, boleia: 0, alerts: 0, perdidos: 0 });
    React.useEffect(() => {
        async function fetchCounts() {
            try {
                const { supabase } = await import('../services/supabase');
                if (!supabase) return;
                const [b, bo, al, pe] = await Promise.all([
                    supabase.from('businesses').select('id', { count: 'exact', head: true }),
                    supabase.from('boleia').select('id', { count: 'exact', head: true }),
                    supabase.from('alerts').select('id', { count: 'exact', head: true }),
                    supabase.from('perdidos_achados').select('id', { count: 'exact', head: true }),
                ]);
                setCounts({ businesses: b.count||0, boleia: bo.count||0, alerts: al.count||0, perdidos: pe.count||0 });
            } catch {}
        }
        fetchCounts();
    }, []);
    const items = [
        { label: 'Negócios', value: counts.businesses, icon: '🏪' },
        { label: 'Boleias', value: counts.boleia, icon: '🚗' },
        { label: 'Alertas', value: counts.alerts, icon: '🛡️' },
        { label: 'Perdidos', value: counts.perdidos, icon: '🔍' },
    ];
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '16px' }}>
            {items.map((item, i) => (
                <div key={i} style={{ background: 'white', borderRadius: '12px', padding: '10px 8px', textAlign: 'center', boxShadow: 'var(--shadow-sm)', border: '1px solid #f3f4f6' }}>
                    <div style={{ fontSize: '1.3rem' }}>{item.icon}</div>
                    <div style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--color-primary)', lineHeight: 1.2 }}>{item.value}</div>
                    <div style={{ fontSize: '0.62rem', color: 'var(--color-text-muted)', fontWeight: '600', marginTop: '1px' }}>{item.label}</div>
                </div>
            ))}
        </div>
    );
};

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

            <WeatherWidget />
            <ActivityCounter />
            <EmergencyWidget />

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
