import React, { useState, useEffect } from 'react';
import { Briefcase, ExternalLink, MapPin, Building, RefreshCw, Loader } from 'lucide-react';
import styles from './Transport.module.css';

// ── Portals pre-filtered for Carregado/Alenquer area ────────────────────────
const JOB_PORTALS = [
    { id: 1, name: 'Net-Empregos', desc: 'Maior portal PT — zona de Alenquer', url: 'https://www.net-empregos.com/pesquisa-empregos.asp?s=Alenquer&c=0&r=0', color: '#EF4444' },
    { id: 2, name: 'Bons Empregos', desc: 'Feed aberto — arredores de Lisboa', url: 'https://www.bonsempregos.com/empregos/alenquer', color: '#10B981' },
    { id: 3, name: 'Sapo Emprego', desc: 'Pesquisar zona de Alenquer', url: 'https://emprego.sapo.pt/empregos?q=&l=Alenquer', color: '#F59E0B' },
    { id: 4, name: 'Indeed Portugal', desc: 'Empregos perto de Carregado', url: 'https://pt.indeed.com/empregos?q=&l=Carregado%2C+Lisboa', color: '#2563EB' },
    { id: 5, name: 'IEFP Online', desc: 'Centro de Emprego público', url: 'https://iefponline.iefp.pt/', color: '#374151' },
    { id: 6, name: 'LinkedIn Jobs', desc: 'Rede profissional', url: 'https://www.linkedin.com/jobs/search/?location=Alenquer%2C%20Portugal', color: '#0077B5' },
];

// ── Location filter: only Lisboa district + nearby ──────────────────────────
const GOOD_LOCATIONS = [
    'lisboa', 'carregado', 'alenquer', 'azambuja', 'vila franca',
    'vfx', 'alverca', 'arruda', 'sobral', 'loures', 'sintra',
    'odivelas', 'mafra', 'cascais', 'amadora', 'oeiras',
    'setúbal', 'setubal', 'montijo', 'palmela', 'santarém', 'santarem',
    'portugal' // fallback for remote/national
];

// ── Exclude categories irrelevant to Carregado's workforce ─────────────────
const EXCLUDED_CATEGORIES = [
    'desenvolvimento de software', 'devops', 'dados e business', 'inteligência artificial',
    'machine learning', 'cibersegurança', 'infraestrutura e redes', 'qualidade e testing',
    'gestão de projetos it', 'cloud'
];

// ── Priority categories for Carregado's working class ──────────────────────
const PRIORITY_CATEGORIES = [
    'armazém', 'logística', 'logistica', 'transportes', 'motorista',
    'limpeza', 'construção', 'construcao', 'obras', 'produção', 'producao',
    'saúde', 'saude', 'enfermagem', 'lar', 'creche', 'social',
    'comércio', 'comercio', 'retalho', 'atendimento', 'caixa',
    'restauração', 'restauracao', 'cozinha', 'segurança', 'seguranca',
    'mecânica', 'mecanica', 'electricidade', 'serralharia', 'pintura',
    'agricultura', 'jardinagem', 'hotelaria', 'receção', 'rececao'
];

// ── Jobs API ─────────────────────────────────────────────────────────────
const JOBS_API = '/api/jobs';

// ── Filter tabs ─────────────────────────────────────────────────────────────
const FILTER_TABS = [
    { key: 'all',        label: '🔍 Todos' },
    { key: 'logistics',  label: '📦 Armazém/Log.' },
    { key: 'care',       label: '❤️ Saúde/Social' },
    { key: 'commerce',   label: '🏪 Comércio' },
    { key: 'building',   label: '🏗️ Construção' },
    { key: 'other',      label: '🔧 Outros' },
];

const CATEGORY_MAP = {
    logistics: ['armazém', 'armazem', 'logística', 'logistica', 'transportes', 'motorista', 'estafeta', 'entrega', 'expedição'],
    care:      ['saúde', 'saude', 'enfermagem', 'auxiliar', 'lar', 'creche', 'social', 'apoio', 'cuidador'],
    commerce:  ['comércio', 'comercio', 'retalho', 'atendimento', 'vendas', 'caixa', 'loja', 'supermercado', 'restauração', 'restauracao', 'cozinha', 'hotelaria'],
    building:  ['construção', 'construcao', 'obras', 'civil', 'electricidade', 'serralharia', 'mecânica', 'mecanica', 'pintura', 'carpintaria', 'jardinagem'],
};

const Jobs = () => {
    const [activeTab, setActiveTab] = useState('live');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    useEffect(() => {
        if (activeTab === 'live') fetchJobs();
    }, [activeTab]);

    async function fetchJobs() {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(JOBS_API, { signal: AbortSignal.timeout(8000) });
            if (!res.ok) throw new Error('API request failed');
            const data = await res.json();
            const list = Array.isArray(data) ? data : (data.jobs || []);
            if (list.length === 0) throw new Error('Empty');

            const mapped = list.map(j => ({
                id: j.jobid,
                title: j.jobtitle || '',
                company: j.jobcompany || '',
                location: j.jobloc || '',
                category: j.jobcat || '',
                url: j.joburl,
                date: j.jobdate,
            }));

            // Step 1: only Lisboa district + nearby
            const byLocation = mapped.filter(j => {
                const loc = j.location.toLowerCase();
                return GOOD_LOCATIONS.some(l => loc.includes(l));
            });

            // Step 2: exclude pure IT categories
            const noIT = byLocation.filter(j => {
                const cat = j.category.toLowerCase();
                return !EXCLUDED_CATEGORIES.some(ex => cat.includes(ex));
            });

            // Step 3: sort — priority categories first
            const prioritised = [
                ...noIT.filter(j => {
                    const combined = (j.title + ' ' + j.category).toLowerCase();
                    return PRIORITY_CATEGORIES.some(p => combined.includes(p));
                }),
                ...noIT.filter(j => {
                    const combined = (j.title + ' ' + j.category).toLowerCase();
                    return !PRIORITY_CATEGORIES.some(p => combined.includes(p));
                }),
            ];

            setJobs(prioritised.slice(0, 50));
            setLastUpdated(new Date());
        } catch {
            setError('Não foi possível carregar empregos. Use os portais diretos abaixo.');
            setJobs([]);
        }
        setLoading(false);
    }

    // Apply category filter tab
    const displayed = jobs.filter(job => {
        if (categoryFilter === 'all') return true;
        const keywords = CATEGORY_MAP[categoryFilter] || [];
        const combined = (job.title + ' ' + job.category).toLowerCase();
        return keywords.some(k => combined.includes(k));
    });

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        try {
            const diff = Math.floor((Date.now() - new Date(dateStr)) / 86400000);
            if (diff === 0) return 'Hoje';
            if (diff === 1) return 'Ontem';
            if (diff < 7) return `${diff}d atrás`;
            return new Date(dateStr).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' });
        } catch { return ''; }
    };

    const tabStyle = (active) => ({
        flex: 1, padding: '10px', border: 'none', borderRadius: '10px',
        fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer', transition: 'all 0.2s',
        background: active ? 'var(--color-secondary)' : 'var(--color-surface)',
        color: active ? 'white' : 'var(--color-text-muted)',
    });

    const filterStyle = (active) => ({
        whiteSpace: 'nowrap', padding: '6px 12px', borderRadius: '20px',
        border: 'none', fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer',
        background: active ? 'var(--color-secondary)' : 'var(--color-surface)',
        color: active ? 'white' : 'var(--color-text-muted)',
    });

    return (
        <div className="container">
            <div className={styles.header}>
                <h1 className={styles.title}>💼 Emprego</h1>
                <p style={{ color: 'var(--color-text-muted)', margin: '4px 0 16px 0' }}>
                    Trabalho na zona de Carregado e arredores
                </p>
            </div>

            {/* Main tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <button onClick={() => setActiveTab('live')} style={tabStyle(activeTab === 'live')}>🟢 Ao Vivo</button>
                <button onClick={() => setActiveTab('links')} style={tabStyle(activeTab === 'links')}>🔗 Portais</button>
            </div>

            {/* LIVE TAB */}
            {activeTab === 'live' && (
                <>
                    {/* Top bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '0.75rem', background: '#ECFDF5', color: '#065F46', fontWeight: '700', padding: '3px 8px', borderRadius: '20px' }}>
                            🇵🇹 Bons Empregos {lastUpdated && `· ${lastUpdated.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}`}
                        </span>
                        <button onClick={fetchJobs} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: '600', fontSize: '0.82rem', cursor: 'pointer', padding: '4px 8px' }}>
                            <RefreshCw size={13} className={loading ? 'spin' : ''} /> Atualizar
                        </button>
                    </div>

                    {/* Category filter chips */}
                    <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none', marginBottom: '14px' }}>
                        {FILTER_TABS.map(f => (
                            <button key={f.key} onClick={() => setCategoryFilter(f.key)} style={filterStyle(categoryFilter === f.key)}>
                                {f.label}
                            </button>
                        ))}
                    </div>

                    {loading && (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                            <Loader size={32} className="spin" color="var(--color-primary)" style={{ display: 'block', margin: '0 auto' }} />
                            <p style={{ marginTop: '12px' }}>A carregar empregos...</p>
                        </div>
                    )}

                    {error && (
                        <div style={{ background: '#FEF2F2', borderLeft: '4px solid #EF4444', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.88rem', color: '#7F1D1D' }}>
                            ⚠️ {error}
                            <button onClick={() => setActiveTab('links')} style={{ background: 'none', border: 'none', color: '#EF4444', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline', marginLeft: '6px' }}>
                                Ver portais →
                            </button>
                        </div>
                    )}

                    {!loading && !error && displayed.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '3rem' }}>
                            <Briefcase size={40} color="#d1d5db" />
                            <p style={{ color: 'var(--color-text-muted)', marginTop: '12px' }}>
                                Sem ofertas nesta categoria de momento.
                            </p>
                            <button onClick={() => setCategoryFilter('all')} style={{ marginTop: '8px', background: 'none', border: 'none', color: 'var(--color-secondary)', fontWeight: '700', cursor: 'pointer' }}>
                                Ver todas →
                            </button>
                        </div>
                    )}

                    <div>
                        {displayed.map((job, idx) => (
                            <a key={job.id || idx} href={job.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
                                <div style={{
                                    background: 'white', borderRadius: '12px', padding: '14px 16px',
                                    marginBottom: '10px', borderLeft: '5px solid var(--color-secondary)',
                                    border: '1px solid #f3f4f6', borderLeft: '5px solid var(--color-secondary)',
                                    boxShadow: 'var(--shadow-sm)', transition: 'box-shadow 0.15s, transform 0.15s',
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: '700', fontSize: '0.97rem', color: 'var(--color-text)', marginBottom: '5px', lineHeight: '1.35' }}>
                                                {job.title}
                                            </div>
                                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                                                {job.company && (
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                                        <Building size={11} /> {job.company}
                                                    </span>
                                                )}
                                                {job.location && (
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                                        <MapPin size={11} /> {job.location}
                                                    </span>
                                                )}
                                                {job.category && (
                                                    <span style={{ fontSize: '0.68rem', fontWeight: '600', color: '#6366F1', background: '#EEF2FF', padding: '2px 7px', borderRadius: '20px' }}>
                                                        {job.category}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
                                            {job.date && <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>{formatDate(job.date)}</span>}
                                            <ExternalLink size={13} color="#9CA3AF" />
                                        </div>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>

                    {displayed.length > 0 && (
                        <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '8px' }}>
                            {displayed.length} ofertas na zona de Lisboa/Carregado · via Bons Empregos
                        </p>
                    )}
                </>
            )}

            {/* PORTALS TAB */}
            {activeTab === 'links' && (
                <div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '14px' }}>
                        Portais portugueses pré-filtrados para a zona de Alenquer/Carregado:
                    </p>
                    {JOB_PORTALS.map(portal => (
                        <a key={portal.id} href={portal.url} target="_blank" rel="noopener noreferrer"
                            style={{
                                textDecoration: 'none', display: 'flex', justifyContent: 'space-between',
                                alignItems: 'center', background: 'white', borderRadius: '12px',
                                padding: '14px 16px', marginBottom: '10px', boxShadow: 'var(--shadow-sm)',
                                borderLeft: `5px solid ${portal.color}`, border: `1px solid #f3f4f6`,
                                borderLeft: `5px solid ${portal.color}`, transition: 'transform 0.15s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateX(3px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                            <div>
                                <div style={{ fontWeight: '700', fontSize: '0.97rem', color: portal.color }}>{portal.name}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>{portal.desc}</div>
                            </div>
                            <ExternalLink size={16} color="#9CA3AF" />
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Jobs;
