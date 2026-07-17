import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Home, Store, ShieldAlert, Car, Heart, Grid } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import styles from './Navbar.module.css';

// All pages accessible via "More" menu
const MORE_LINKS = [
    { to: '/events',   label: '📅 Eventos' },
    { to: '/news',     label: '📰 Notícias' },
    { to: '/jobs',     label: '💼 Emprego' },
    { to: '/housing',  label: '🏠 Habitação' },
    { to: '/transport',label: '🚌 Transportes' },
    { to: '/map',      label: '🗺️ Mapa' },
    { to: '/report',   label: '📋 Reportar' },
];

const Navbar = () => {
    const { t } = useTranslation();
    const [showMore, setShowMore] = useState(false);
    const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');

    const toggleDark = () => {
        const next = !dark;
        setDark(next);
        localStorage.setItem('theme', next ? 'dark' : 'light');
        document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
    };

    // Apply on mount
    React.useEffect(() => {
        const saved = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', saved);
        setDark(saved === 'dark');
    }, []);

    return (
        <>
            {/* More menu overlay */}
            {showMore && (
                <>
                    <div onClick={() => setShowMore(false)} style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.3)' }} />
                    <div style={{
                        position: 'fixed', bottom: '70px', left: '50%', transform: 'translateX(-50%)',
                        width: 'min(340px, 92vw)', background: 'white', borderRadius: '16px',
                        boxShadow: '0 -4px 32px rgba(0,0,0,0.15)', zIndex: 50,
                        padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px',
                    }}>
                        <div style={{ gridColumn: '1/-1', fontWeight: '800', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Mais páginas
                        </div>
                        {MORE_LINKS.map(link => (
                            <NavLink key={link.to} to={link.to} onClick={() => setShowMore(false)}
                                style={{ display: 'block', padding: '10px 14px', borderRadius: '10px', background: 'var(--color-surface)', color: 'var(--color-text)', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' }}>
                                {link.label}
                            </NavLink>
                        ))}
                    </div>
                </>
            )}

            <header style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 60,
                background: 'white', borderBottom: '1px solid #e5e7eb',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 16px', height: '52px',
                boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
            }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                    <img src="/logo2580.png" alt="2580 Carregado" style={{ height: '36px', width: '36px', borderRadius: '8px', objectFit: 'cover' }} />
                    <div>
                        <div style={{ fontWeight: '800', fontSize: '1.05rem', color: 'var(--color-primary)', lineHeight: 1.1 }}>2580</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Carregado</div>
                    </div>
                </Link>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: '500' }}>
                    A tua comunidade online
                </div>
                <button
                    onClick={toggleDark}
                    title={dark ? 'Modo Claro' : 'Modo Escuro'}
                    style={{ background: dark ? '#374151' : '#F3F4F6', border: 'none', borderRadius: '50%', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1.1rem', flexShrink: 0, transition: 'background 0.2s' }}
                >
                    {dark ? '☀️' : '🌙'}
                </button>
            </header>

            <nav className={styles.navbar}>
                <NavLink to="/" end className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>
                    <Home size={22} />
                    <span>Início</span>
                </NavLink>
                <NavLink to="/directory" className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>
                    <Store size={22} />
                    <span>Negócios</span>
                </NavLink>
                <NavLink to="/boleia" className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>
                    <Car size={22} />
                    <span>Boleia</span>
                </NavLink>
                <NavLink to="/alerts" className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>
                    <ShieldAlert size={22} />
                    <span>Alertas</span>
                </NavLink>
                <NavLink to="/perdidos" className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>
                    <Heart size={22} />
                    <span>Perdidos</span>
                </NavLink>
                <button onClick={() => setShowMore(!showMore)} className={styles.link} style={{ background: 'none', border: 'none' }}>
                    <Grid size={22} />
                    <span>Mais</span>
                </button>
            </nav>
        </>
    );
};

export default Navbar;
