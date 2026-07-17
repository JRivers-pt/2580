import React, { useState, useEffect } from 'react';
import { Home, ExternalLink, PlusCircle, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../services/supabase';
import { housingLinks } from '../data/externalLinks';
import styles from './Home.module.css'; // Use the new Glass styles

const mockListings = [
    {
        id: 1,
        type: 'Arrendamento',
        title: 'Quarto em T3 perto do Aldi',
        contact: 'Maria S. — 9XX XXX XXX',
        description: 'Quarto mobilado, despesas incluídas. Preferência feminina.',
        date: '2 Oct',
        is_premium: false
    },
    {
        id: 2,
        type: 'Venda',
        title: 'T2 Centro do Carregado',
        contact: 'Imobiliária Local — 9XX XXX XXX',
        description: 'RENOVADO. Garagem, 2.º andar com elevador.',
        date: 'Hoje',
        is_premium: true
    }
];

const Housing = () => {
    const [activeTab, setActiveTab] = useState('board');
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    // Missing IDs fixed:
    const [newListing, setNewListing] = useState({ type: 'Arrendamento', title: '', contact: '', description: '' });
    const [submitting, setSubmitting] = useState(false);
    const [fetchError, setFetchError] = useState(null);
    const { t } = useTranslation();

    useEffect(() => {
        async function fetchListings() {
            setLoading(true);
            setFetchError(null);
            if (!supabase) {
                setListings(mockListings);
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('housing_listings')
                .select('*')
                .order('created_at', { ascending: false });

            if (error || !data) {
                console.error("Error fetching listings:", error);
                setFetchError(error ? error.message : "Unknown error");
                setListings(mockListings); // Fallback to mock data
            } else {
                setListings(data);
            }
            setLoading(false);
        }

        if (activeTab === 'board') {
            fetchListings();
        }
    }, [activeTab]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        if (!supabase) {
            alert("Supabase client not initialized. Cannot post listing.");
            setSubmitting(false);
            return;
        }

        const listingToInsert = {
            ...newListing,
            is_premium: false,
        };

        const { data, error } = await supabase
            .from('housing_listings')
            .insert([listingToInsert])
            .select();

        if (error) {
            console.error("Error posting listing:", error);
            alert("Failed to post listing: " + error.message);
        } else {
            setListings(prev => [data[0], ...prev]);
            setNewListing({ type: 'Arrendamento', title: '', contact: '', description: '' });
            alert("Listing posted successfully!");
        }
        setSubmitting(false);
    };

    return (
        <div className="container">
            <div className={styles.header}>
                <h1 className={styles.title}>{t('housing_title')}</h1>
                <p style={{ color: 'var(--color-text-muted)' }}>{t('housing_subtitle')}</p>
            </div>

            <div className={styles.tabs}>
                <button
                    className={`${styles.tabBtn} ${activeTab === 'board' ? styles.active : ''}`}
                    onClick={() => setActiveTab('board')}
                >
                    {t('community_board')}
                </button>
                <button
                    className={`${styles.tabBtn} ${activeTab === 'search' ? styles.active : ''}`}
                    onClick={() => setActiveTab('search')}
                >
                    {t('web_search')}
                </button>
            </div>

            {activeTab === 'board' ? (
                <>
                    <div style={{ background: '#FEF2F2', borderLeft: '4px solid #EF4444', padding: '12px', margin: '16px 0', borderRadius: '4px', fontSize: '0.9rem', color: '#7F1D1D' }}>
                        <strong>{t('safety_warning')}</strong>
                    </div>

                    <div className={styles.formSection}>
                        <h3>{t('post_rental')}</h3>
                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.formGrid}>
                            <select
                                    value={newListing.type}
                                    onChange={(e) => setNewListing({ ...newListing, type: e.target.value })}
                                    required
                                    style={{ padding: '10px', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '0.9rem', fontFamily: 'inherit' }}
                                >
                                    <option value="Arrendamento">🏠 Arrendamento</option>
                                    <option value="Venda">🏷️ Venda</option>
                                    <option value="Quarto">🛏️ Quarto</option>
                                </select>
                            </div>
                            <input
                                type="text"
                                placeholder="Título (ex: Quarto em T3 perto do Aldi)"
                                value={newListing.title}
                                onChange={(e) => setNewListing({ ...newListing, title: e.target.value })}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Contacto (Telemóvel ou Email)"
                                value={newListing.contact}
                                onChange={(e) => setNewListing({ ...newListing, contact: e.target.value })}
                                required
                            />
                            <textarea
                                placeholder="Descrição (Localização, condições, despesas incluídas?)"
                                value={newListing.description}
                                onChange={(e) => setNewListing({ ...newListing, description: e.target.value })}
                                required
                                className={styles.textarea}
                            />
                            <button type="submit" className={styles.submitBtn} disabled={submitting}>
                                {submitting ? 'A publicar...' : 'Publicar Anúncio (Grátis)'}
                            </button>
                        </form>

                        <div style={{ marginTop: '24px', textAlign: 'center', padding: '20px', background: '#FFFBEB', borderRadius: '8px', border: '1px dashed #F59E0B' }}>
                            <h4 style={{ margin: '0 0 8px 0', color: '#B45309' }}>{t('want_to_sell')}</h4>
                            <p style={{ fontSize: '0.9rem', color: '#92400E', marginBottom: '12px' }}>
                                {t('premium_info')}
                            </p>
                            <a href="mailto:official@2580connect.pt" style={{
                                background: '#F59E0B', color: 'white', padding: '8px 16px', borderRadius: '6px',
                                textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem'
                            }}>
                                {t('request_premium')}
                            </a>
                        </div>
                    </div>

                    <div className={styles.list}>
                        <h3>{t('latest_listings')}</h3>
                        {fetchError && <p style={{ color: 'red' }}>Error loading board: {fetchError}</p>}

                        {loading ? <p>Loading...</p> : listings.map(item => (
                            <div
                                key={item.id}
                                className={styles.card}
                                style={{
                                    borderLeftColor: item.type === 'Rent' ? '#3B82F6' : '#10B981',
                                    border: item.is_premium ? '2px solid #F59E0B' : 'none',
                                    borderLeft: item.is_premium ? '5px solid #F59E0B' : `5px solid ${item.type === 'Rent' ? '#3B82F6' : '#10B981'}`,
                                    background: item.is_premium ? 'linear-gradient(to right, #FFFBEB, #FFFFFF)' : 'white'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <span className={styles.operator} style={{ color: item.type === 'Rent' ? '#3B82F6' : '#10B981' }}>
                                        {item.type} {item.is_premium && <span style={{ background: '#F59E0B', color: 'white', padding: '0 6px', borderRadius: '4px', fontSize: '0.7rem', marginLeft: '6px' }}>DESTAQUE</span>}
                                    </span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{item.date?.substring(0, 10) || 'Just now'}</span>
                                </div>
                                <div className={styles.routeTitle}>{item.title}</div>
                                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', margin: '6px 0 12px 0' }}>{item.description}</p>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                    <a
                                        href={item.contact?.match(/\d{9}/) ? `tel:${item.contact.match(/\d{9}/)[0]}` : `mailto:${item.contact}`}
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', background: '#ECFDF5', color: '#10B981', textDecoration: 'none', fontWeight: '700', fontSize: '0.85rem', border: '1px solid #A7F3D0' }}
                                    >
                                        📞 Contactar para preço e info
                                    </a>
                                    <a
                                        href={`https://wa.me/?text=${encodeURIComponent(`🏠 ${item.type}: ${item.title}\n${item.description}\n📞 Contactar: ${item.contact}\n\nVia 2580 Carregado`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ display:'inline-flex', alignItems:'center', gap:'5px', padding:'6px 12px', borderRadius:'8px', background:'#25D366', color:'white', textDecoration:'none', fontWeight:'700', fontSize:'0.8rem', flexShrink: 0 }}
                                        onClick={e => e.stopPropagation()}
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                        Partilhar
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className={styles.list}>
                    {housingLinks.map(link => (
                        <a
                            key={link.id}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.card}
                            style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                        >
                            <div>
                                <div className={styles.operator}>{link.platform}</div>
                                <div className={styles.routeTitle}>{link.title}</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{link.description}</div>
                            </div>
                            <ExternalLink size={20} color="var(--color-text-muted)" />
                        </a>
                    ))}
                </div>
            )
            }
        </div >
    );
};

export default Housing;
