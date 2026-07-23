import * as cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client (uses Server Env Vars provided by Vercel)
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export default async function handler(req, res) {
    if (!supabase) {
        return res.status(500).json({ error: 'Supabase credentials not configured.' });
    }

    try {
        console.log('Fetching news from carregado.pt...');
        
        // 1. Fetch the raw HTML from the parish website
        const response = await fetch('https://carregado.pt/index.php/noticias/');
        if (!response.ok) {
            throw new Error(`Failed to fetch from carregado.pt: ${response.statusText}`);
        }
        
        const html = await response.text();
        const $ = cheerio.load(html);
        const newsItems = [];

        // 2. Parse the HTML to extract news
        // Note: WordPress commonly uses article or .post classes.
        $('article').each((i, el) => {
            const titleElement = $(el).find('h2 a, h3 a');
            const title = titleElement.text().trim();
            const link = titleElement.attr('href');
            
            // Extract a short excerpt/body
            let body = $(el).find('.entry-content p, .entry-summary p').first().text().trim();
            if (!body) body = title; // fallback

            // Try to extract date
            let dateStr = $(el).find('.published, .entry-date, time').attr('datetime');
            let createdAt = dateStr ? new Date(dateStr).toISOString() : new Date().toISOString();

            if (title && link) {
                newsItems.push({
                    title: title,
                    body: body,
                    author: 'Junta de Freguesia',
                    created_at: createdAt
                });
            }
        });

        if (newsItems.length === 0) {
            return res.status(200).json({ message: 'No news found to parse.', count: 0 });
        }

        // 3. Upsert into Supabase to prevent duplicates
        // We'll fetch existing titles first to avoid inserting duplicates if there's no unique constraint
        const { data: existingNews } = await supabase
            .from('news')
            .select('title')
            .order('created_at', { ascending: false })
            .limit(50);

        const existingTitles = new Set((existingNews || []).map(n => n.title));

        const newItemsToInsert = newsItems.filter(item => !existingTitles.has(item.title));

        if (newItemsToInsert.length > 0) {
            const { error } = await supabase.from('news').insert(newItemsToInsert);
            if (error) {
                console.error('Supabase Insert Error:', error);
                throw error;
            }
        }

        return res.status(200).json({
            message: 'News sync complete',
            parsed: newsItems.length,
            inserted: newItemsToInsert.length
        });

    } catch (error) {
        console.error('Scraper error:', error);
        return res.status(500).json({ error: error.message });
    }
}
