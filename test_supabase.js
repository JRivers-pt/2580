import { createClient } from '@supabase/supabase-js';

const url = 'https://xzhjsccjzmacpbvffczu.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6aGpzY2Nqem1hY3BidmZmY3p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyNzYyOTEsImV4cCI6MjA5OTg1MjI5MX0.zUPzORgfnLvj3gWi0LEjeoHTRd_MlAM_CeVFhuFsJSQ';

const supabase = createClient(url, key);

async function test() {
    console.log('Testing Supabase login...');
    try {
        const { data, error } = await supabase.auth.signInWithOtp({ email: 'joaodmribeiro@outlook.com' });
        if (error) {
            console.error('Supabase Error:', error.message);
        } else {
            console.log('Success! Magic link sent to joaodmribeiro@outlook.com', data);
        }
    } catch (e) {
        console.error('Exception caught:', e);
    }
}

test();
