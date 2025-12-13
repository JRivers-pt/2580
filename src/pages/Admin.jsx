import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

const Admin = () => {
    const [session, setSession] = useState(null);
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [news, setNews] = useState({ title: '', body: '' });
    const [premium, setPremium] = useState({ title: '', price: '', contact: '', description: '' });

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.signInWithOtp({ email });
        if (error) alert(error.message);
        else alert('Check your email for the login link!');
        setLoading(false);
    };

    const handlePostNews = async (e) => {
        e.preventDefault();
        if (!session) return;

        const { error } = await supabase
            .from('news')
            .insert([news]);

        if (error) alert(error.message);
        else {
            alert('News posted!');
            setNews({ title: '', body: '' });
        }
    };

    const handlePostPremium = async (e) => {
        e.preventDefault();
        if (!session) return;

        const listing = {
            ...premium,
            type: 'Sale', // Premium usually Sales
            isPremium: true,
            date: new Date().toISOString()
        };

        const { error } = await supabase
            .from('housing_listings')
            .insert([listing]);

        if (error) alert(error.message);
        else {
            alert('Premium Listing posted!');
            setPremium({ title: '', price: '', contact: '', description: '' });
        }
    };

    if (!session) {
        return (
            <div className="container" style={{ padding: '20px', maxWidth: '400px' }}>
                <h1>Admin Login</h1>
                <p>Junta staff only.</p>
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <input
                        type="email"
                        placeholder="official@junta.pt"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ padding: '10px' }}
                    />
                    <button type="submit" disabled={loading} style={{ padding: '10px', background: 'var(--color-primary)', color: 'white', border: 'none' }}>
                        {loading ? 'Sending link...' : 'Send Magic Link'}
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '20px' }}>
            <h1>Admin Dashboard</h1>
            <p>Welcome, {session.user.email}</p>

            <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <h2>📢 Post News</h2>
                    <form onSubmit={handlePostNews} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <input
                            type="text"
                            placeholder="Title (e.g. Road Works)"
                            value={news.title}
                            onChange={(e) => setNews({ ...news, title: e.target.value })}
                            style={{ padding: '10px' }}
                        />
                        <textarea
                            placeholder="Body text..."
                            value={news.body}
                            onChange={(e) => setNews({ ...news, body: e.target.value })}
                            style={{ padding: '10px', height: '100px' }}
                        />
                        <button type="submit" style={{ padding: '10px', background: 'var(--color-primary)', color: 'white', border: 'none' }}>
                            Post Live News
                        </button>
                    </form>
                </div>

                <div style={{ background: '#FFFBEB', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', border: '1px solid #F59E0B' }}>
                    <h2 style={{ color: '#B45309' }}>🌟 Post Premium Listing</h2>
                    <p style={{ fontSize: '0.8rem', color: '#92400E' }}>Use this after receiving payment.</p>
                    <form onSubmit={handlePostPremium} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <input
                            type="text"
                            placeholder="Title (e.g. T3 Luxury)"
                            value={premium.title}
                            onChange={(e) => setPremium({ ...premium, title: e.target.value })}
                            style={{ padding: '10px' }}
                        />
                        <input
                            type="text"
                            placeholder="Price (e.g. €250,000)"
                            value={premium.price}
                            onChange={(e) => setPremium({ ...premium, price: e.target.value })}
                            style={{ padding: '10px' }}
                        />
                        <input
                            type="text"
                            placeholder="Contact Info"
                            value={premium.contact}
                            onChange={(e) => setPremium({ ...premium, contact: e.target.value })}
                            style={{ padding: '10px' }}
                        />
                        <textarea
                            placeholder="Description..."
                            value={premium.description}
                            onChange={(e) => setPremium({ ...premium, description: e.target.value })}
                            style={{ padding: '10px', height: '100px' }}
                        />
                        <button type="submit" style={{ padding: '10px', background: '#F59E0B', color: 'white', border: 'none' }}>
                            Post Premium Ad
                        </button>
                    </form>
                </div>
            </div>

            <button
                onClick={() => supabase.auth.signOut()}
                style={{ marginTop: '20px', background: '#ccc', padding: '8px 16px', border: 'none' }}
            >
                Sign Out
            </button>
        </div>
    );
};

export default Admin;
