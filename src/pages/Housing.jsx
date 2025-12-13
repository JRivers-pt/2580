import React, { useState, useEffect } from 'react';
import { Home, ExternalLink, PlusCircle, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../services/supabase';
import { housingLinks } from '../data/externalLinks';
import styles from './Home.module.css'; // Use the new Glass styles

const mockListings = [
    {
        id: 1,
        type: 'Rent',
        title: 'Room in T3 near Aldi',
        price: '€350',
        contact: 'Maria S.',
        description: 'Furnished room, bills included. Female preferred.',
        date: '2 Oct',
        isPremium: false
    },
    {
        id: 2,
        type: 'Sale',
        title: 'T2 Carregado Centre',
        price: '€185,000',
        contact: 'Imobiliária Local',
        description: 'RENOVATED. Garage, 2nd floor w/ elevator. Best investment.',
        date: 'Hoje',
        isPremium: true
    }
];

const Housing = () => {
    const [activeTab, setActiveTab] = useState('board');
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    // Missing IDs fixed:
    const [newListing, setNewListing] = useState({ type: 'Rent', title: '', price: '', contact: '', description: '' });
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
            date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
            isPremium: false, // New listings are not premium by default
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
            setNewListing({ type: 'Rent', title: '', price: '', contact: '', description: '' });
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
                                    disabled // Locked to Rent
                                    style={{ background: '#f3f4f6' }}
                                >
                                    <option value="Rent">Rent (Arrendamento)</option>
                                </select>
                                <input
                                    type="text"
                                    placeholder="Price (e.g. €400/month)"
                                    value={newListing.price}
                                    onChange={(e) => setNewListing({ ...newListing, price: e.target.value })}
                                    required
                                />
                            </div>
                            <input
                                type="text"
                                placeholder="Title (e.g. Quarto em T3 perto do Aldi)"
                                value={newListing.title}
                                onChange={(e) => setNewListing({ ...newListing, title: e.target.value })}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Contact (Phone or Email)"
                                value={newListing.contact}
                                onChange={(e) => setNewListing({ ...newListing, contact: e.target.value })}
                                required
                            />
                            <textarea
                                placeholder="Description (Location, Conditions, Bills included?)"
                                value={newListing.description}
                                onChange={(e) => setNewListing({ ...newListing, description: e.target.value })}
                                required
                                className={styles.textarea}
                            />
                            <button type="submit" className={styles.submitBtn} disabled={submitting}>
                                {submitting ? 'Posting...' : t('post_rental')}
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
                        <h3>Latest Listings</h3>
                        {fetchError && <p style={{ color: 'red' }}>Error loading board: {fetchError}</p>}

                        {loading ? <p>Loading...</p> : listings.map(item => (
                            <div
                                key={item.id}
                                className={styles.card}
                                style={{
                                    borderLeftColor: item.type === 'Rent' ? '#3B82F6' : '#10B981',
                                    border: item.isPremium ? '2px solid #F59E0B' : 'none',
                                    borderLeft: item.isPremium ? '5px solid #F59E0B' : `5px solid ${item.type === 'Rent' ? '#3B82F6' : '#10B981'}`,
                                    background: item.isPremium ? 'linear-gradient(to right, #FFFBEB, #FFFFFF)' : 'white'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <span className={styles.operator} style={{ color: item.type === 'Rent' ? '#3B82F6' : '#10B981' }}>
                                        {item.type} {item.isPremium && <span style={{ background: '#F59E0B', color: 'white', padding: '0 6px', borderRadius: '4px', fontSize: '0.7rem', marginLeft: '6px' }}>DESTAQUE</span>}
                                    </span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{item.date?.substring(0, 10) || 'Just now'}</span>
                                </div>
                                <div className={styles.routeTitle}>{item.title}</div>
                                <div style={{ fontWeight: '800', fontSize: '1.2rem', margin: '4px 0' }}>{item.price}</div>
                                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', margin: '4px 0 12px 0' }}>{item.description}</p>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                                    <User size={16} />
                                    <span>{item.contact}</span>
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
