import React, { useState, useEffect } from 'react';
import { Briefcase, MapPin, Clock, ExternalLink, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { jobListings as featuredJobs } from '../data/jobData';
import styles from './Transport.module.css';

const Jobs = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('live'); // 'live' or 'featured'
    const [liveJobs, setLiveJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchLiveJobs = async () => {
        setLoading(true);
        setError(null);
        try {
            // Net-Empregos Search URL for Carregado
            const targetUrl = 'https://www.net-empregos.com/pesquisa-empregos.asp?chaves=&cidade=Carregado&categoria=0&zona=0&tipo=0';
            // Use AllOrigins as CORS Proxy
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;

            const response = await fetch(proxyUrl);
            const data = await response.json();

            if (!data.contents) throw new Error("No data received");

            // Parse HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(data.contents, 'text/html');

            // Select job items (Net-Empregos uses .job-item or similar, generally inside .content-area)
            // Inspecting their structure: they often use simple <div> lists or tables. 
            // Let's try to match standard links inside the listing area.

            // Robust selector strategy: look for links containing 'oferta-emprego'
            const jobLinks = Array.from(doc.querySelectorAll('a[href*="oferta-emprego-id"]'));

            const scraped = jobLinks.map((link, index) => {
                // Title is usually inside the link
                const title = link.textContent.trim();
                // Description/Company is often near parent
                const container = link.closest('div') || link.parentElement;
                const snippet = container ? container.textContent.replace(title, '').trim().substring(0, 100) : '';

                if (!title) return null;

                return {
                    id: `live-${index}`,
                    title: title || "Job Opportunity",
                    company: "Net-Empregos Listing", // Hard to parse perfectly without specific selectors
                    location: "Carregado",
                    salary: "Ver Oferta",
                    type: "Full-time",
                    date: "Recent",
                    description: snippet + "...",
                    url: "https://www.net-empregos.com" + link.getAttribute('href'),
                    isLive: true
                };
            }).filter(job => job && job.title.length > 5).slice(0, 10); // Limit to 10 valid

            // Remove duplicates based on URL or Title
            const uniqueJobs = scraped.filter((v, i, a) => a.findIndex(v2 => (v2.title === v.title)) === i);

            if (uniqueJobs.length === 0) {
                // Fallback if scraping fails layout change
                throw new Error("Parse failed");
            }

            setLiveJobs(uniqueJobs);
        } catch (err) {
            console.error("Scrape Error:", err);
            // Fallback
            setError("Could not load live feed. Showing featured jobs.");
            setActiveTab('featured');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Initial fetch
        fetchLiveJobs();
    }, []);

    const displayJobs = activeTab === 'live' ? (liveJobs.length > 0 ? liveJobs : featuredJobs) : featuredJobs;

    return (
        <div className="container">
            <div className={styles.header}>
                <h1 className={styles.title}>{t('jobs_title')}</h1>
                <p style={{ color: 'var(--color-text-muted)' }}>{t('jobs_subtitle')}</p>
            </div>

            <div className={styles.controls}>
                <button
                    className={`${styles.tabBtn} ${activeTab === 'live' ? styles.active : ''}`}
                    onClick={() => setActiveTab('live')}
                >
                    <RefreshCw size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                    {t('live_feed')}
                </button>
                <button
                    className={`${styles.tabBtn} ${activeTab === 'featured' ? styles.active : ''}`}
                    onClick={() => setActiveTab('featured')}
                >
                    <Briefcase size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                    {t('featured_jobs')}
                </button>
            </div>

            {loading && activeTab === 'live' && (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                    <RefreshCw className={styles.spin} size={30} />
                    <p>Searching Net-Empregos...</p>
                </div>
            )}

            {error && activeTab === 'live' && !loading && (
                <div style={{ padding: '1rem', background: '#FEF2F2', color: '#991B1B', borderRadius: '8px', marginBottom: '1rem' }}>
                    {error}
                </div>
            )}

            <div className={styles.list}>
                {displayJobs.map(job => (
                    <div key={job.id} className={styles.card} style={{ borderLeftColor: job.isLive ? '#DC2626' : '#0D9488' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                            <span className={styles.operator} style={{ color: job.isLive ? '#DC2626' : '#0D9488' }}>
                                {job.company}
                            </span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{job.date}</span>
                        </div>

                        <div className={styles.routeTitle}>{job.title}</div>

                        <div style={{ display: 'flex', gap: '12px', margin: '8px 0', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <MapPin size={16} />
                                <span>{job.location}</span>
                            </div>
                        </div>

                        {!job.isLive && (
                            <div style={{ fontWeight: '700', margin: '4px 0 8px 0' }}>
                                {t('salary')}: {job.salary}
                            </div>
                        )}

                        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>{job.description}</p>

                        {job.tags && (
                            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                {job.tags.map(tag => (
                                    <span key={tag} style={{ background: '#f0fdf4', color: '#166534', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600' }}>
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        <a
                            href={job.url || "#"}
                            target={job.isLive ? "_blank" : "_self"}
                            rel={job.isLive ? "noopener noreferrer" : ""}
                            style={{
                                marginTop: '16px',
                                width: '100%',
                                background: job.isLive ? '#DC2626' : 'var(--color-primary)',
                                color: 'white',
                                border: 'none',
                                padding: '10px',
                                borderRadius: '8px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textDecoration: 'none',
                                gap: '8px'
                            }}>
                            {t('apply_now')} <ExternalLink size={16} />
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Jobs;
