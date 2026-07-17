import React, { useState, useEffect } from 'react';
import { Store, Phone, Globe, Instagram, Star, Search, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../services/supabase';
import styles from './Transport.module.css';

const CATEGORIES = ['Todos', 'Restaurantes', 'Cafés', 'Comércio', 'Serviços', 'Saúde', 'Auto', 'Beleza', 'Outros'];

const mockBusinesses = [
    {
        id: 1,
        name: 'Padaria Carregadense',
        category: 'Cafés',
        address: 'Rua Vaz Monteiro, 107, 2580-505 Carregado',
        phone: '263 000 000',
        description: 'Pão fresco todos os dias desde 1985. A padaria de confiança do Carregado.',
        website: null,
        instagram: null,
        is_premium: true,
    },
    {
        id: 2,
        name: 'Oficina Central',
        category: 'Auto',
        address: 'Zona Industrial, Carregado',
        phone: '263 000 001',
        description: 'Revisões, reparações e inspeções. Preço justo e trabalho garantido.',
        website: null,
        instagram: null,
        is_premium: false,
    },
    {
        id: 3,
        name: 'Talho do Povo',
        category: 'Comércio',
        address: 'Mercado Municipal, Carregado',
        phone: '263 000 002',
        description: 'A melhor carne do Carregado. Produto local e fresco.',
        website: null,
        instagram: null,
        is_premium: true,
    },
];

const categoryColors = {
    'Restaurantes': '#EF4444',
    'Cafés': '#F59E0B',
    'Comércio': '#10B981',
    'Serviços': '#3B82F6',
    'Saúde': '#EC4899',
    'Auto': '#6366F1',
    'Beleza': '#8B5CF6',
    'Outros': '#6B7280',
};

const Directory = () => {
    const [businesses, setBusinesses] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [activeCategory, setActiveCategory] = useState('Todos');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation();

    useEffect(() => {
        async function fetchBusinesses() {
            setLoading(true);
            if (!supabase) {
                setBusinesses(mockBusinesses);
                setLoading(false);
                return;
            }
            const { data, error } = await supabase
                .from('businesses')
                .select('*')
                .eq('is_active', true)
                .order('is_premium', { ascending: false })
                .order('name', { ascending: true });

            if (error || !data) {
                setBusinesses(mockBusinesses);
            } else {
                setBusinesses(data.length > 0 ? data : mockBusinesses);
            }
            setLoading(false);
        }
        fetchBusinesses();
    }, []);

    useEffect(() => {
        let result = businesses;
        if (activeCategory !== 'Todos') {
            result = result.filter(b => b.category === activeCategory);
        }
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(b =>
                b.name.toLowerCase().includes(q) ||
                b.description?.toLowerCase().includes(q) ||
                b.category.toLowerCase().includes(q)
            );
        }
        setFiltered(result);
    }, [businesses, activeCategory, search]);

    return (
        <div className="container">
            {/* Header */}
            <div className={styles.header}>
                <h1 className={styles.title}>📍 {t('directory_title') || 'Diretório Local'}</h1>
                <p style={{ color: 'var(--color-text-muted)', margin: '4px 0 16px 0' }}>
                    {t('directory_subtitle') || 'Negócios do Carregado'}
                </p>

                {/* Search bar */}
                <div style={{ position: 'relative', marginBottom: '12px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                    <input
                        type="text"
                        placeholder={t('search_businesses') || 'Pesquisar negócios...'}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{
                            width: '100%', padding: '10px 10px 10px 36px',
                            borderRadius: '10px', border: '1.5px solid #e5e7eb',
                            fontSize: '0.95rem', fontFamily: 'inherit',
                            boxSizing: 'border-box', outline: 'none',
                            background: 'white'
                        }}
                    />
                </div>

                {/* Category filter - horizontal scroll */}
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            style={{
                                whiteSpace: 'nowrap', padding: '6px 14px',
                                borderRadius: '20px', border: 'none', fontSize: '0.85rem',
                                fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s',
                                background: activeCategory === cat ? 'var(--color-primary)' : 'var(--color-surface)',
                                color: activeCategory === cat ? 'white' : 'var(--color-text-muted)',
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Premium section */}
            {filtered.some(b => b.is_premium) && activeCategory === 'Todos' && !search && (
                <div style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                        <Star size={14} color="#F59E0B" fill="#F59E0B" />
                        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Parceiros em Destaque
                        </span>
                    </div>
                    {filtered.filter(b => b.is_premium).map(b => (
                        <BusinessCard key={b.id} business={b} />
                    ))}
                    <div style={{ height: '1px', background: '#e5e7eb', margin: '16px 0' }} />
                </div>
            )}

            {/* All businesses */}
            <div className={styles.list}>
                {loading ? (
                    <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '2rem' }}>
                        A carregar...
                    </p>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                        <Store size={40} color="#d1d5db" />
                        <p style={{ color: 'var(--color-text-muted)', marginTop: '12px' }}>
                            {search ? 'Nenhum resultado encontrado.' : 'Sem negócios nesta categoria ainda.'}
                        </p>
                    </div>
                ) : (
                    filtered
                        .filter(b => activeCategory !== 'Todos' || search || !b.is_premium)
                        .map(b => <BusinessCard key={b.id} business={b} />)
                )}
            </div>

            {/* CTA for businesses */}
            <div style={{
                marginTop: '24px', padding: '20px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #10B981, #3B82F6)',
                color: 'white', textAlign: 'center'
            }}>
                <Store size={24} style={{ marginBottom: '8px' }} />
                <h3 style={{ margin: '0 0 6px 0', fontSize: '1rem' }}>O seu negócio não está aqui?</h3>
                <p style={{ margin: '0 0 12px 0', fontSize: '0.85rem', opacity: 0.9 }}>
                    Listagem grátis • Destaque a partir de €15/mês
                </p>
                <a
                    href="mailto:oficial@2580carregado.pt?subject=Quero listar o meu negócio"
                    style={{
                        display: 'inline-block', background: 'white',
                        color: '#10B981', fontWeight: '700', padding: '8px 20px',
                        borderRadius: '20px', textDecoration: 'none', fontSize: '0.9rem'
                    }}
                >
                    Contactar
                </a>
            </div>
        </div>
    );
};

const BusinessCard = ({ business }) => {
    const [expanded, setExpanded] = useState(false);
    const catColor = categoryColors[business.category] || '#6B7280';

    return (
        <div
            style={{
                background: 'white',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '10px',
                boxShadow: business.is_premium ? '0 4px 16px rgba(245,158,11,0.15)' : 'var(--shadow-sm)',
                border: business.is_premium ? '2px solid #F59E0B' : '1px solid #f3f4f6',
                borderLeft: `5px solid ${business.is_premium ? '#F59E0B' : catColor}`,
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{
                            background: catColor + '20', color: catColor,
                            fontSize: '0.7rem', fontWeight: '700', padding: '2px 8px',
                            borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.4px'
                        }}>
                            {business.category}
                        </span>
                        {business.is_premium && (
                            <span style={{
                                background: '#F59E0B', color: 'white',
                                fontSize: '0.65rem', fontWeight: '700', padding: '2px 6px',
                                borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '3px'
                            }}>
                                <Star size={9} fill="white" /> DESTAQUE
                            </span>
                        )}
                    </div>
                    <div style={{ fontWeight: '800', fontSize: '1.05rem', color: 'var(--color-text)' }}>
                        {business.name}
                    </div>
                    {business.address && (
                        <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                            📍 {business.address}
                        </div>
                    )}
                </div>
                <button
                    onClick={() => setExpanded(!expanded)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--color-text-muted)' }}
                >
                    <ChevronDown size={18} style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
                </button>
            </div>

            {expanded && (
                <div style={{ marginTop: '12px', borderTop: '1px solid #f3f4f6', paddingTop: '12px' }}>
                    {business.description && (
                        <p style={{ fontSize: '0.9rem', color: 'var(--color-text)', lineHeight: '1.5', margin: '0 0 12px 0' }}>
                            {business.description}
                        </p>
                    )}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {business.phone && (
                            <a href={`tel:${business.phone}`} style={{
                                display: 'flex', alignItems: 'center', gap: '5px',
                                padding: '6px 12px', borderRadius: '8px', background: '#ECFDF5',
                                color: '#10B981', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '600'
                            }}>
                                <Phone size={14} /> {business.phone}
                            </a>
                        )}
                        {business.website && (
                            <a href={business.website} target="_blank" rel="noopener noreferrer" style={{
                                display: 'flex', alignItems: 'center', gap: '5px',
                                padding: '6px 12px', borderRadius: '8px', background: '#EFF6FF',
                                color: '#3B82F6', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '600'
                            }}>
                                <Globe size={14} /> Website
                            </a>
                        )}
                        {business.instagram && (
                            <a href={`https://instagram.com/${business.instagram}`} target="_blank" rel="noopener noreferrer" style={{
                                display: 'flex', alignItems: 'center', gap: '5px',
                                padding: '6px 12px', borderRadius: '8px', background: '#FDF4FF',
                                color: '#8B5CF6', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '600'
                            }}>
                                <Instagram size={14} /> @{business.instagram}
                            </a>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Directory;
