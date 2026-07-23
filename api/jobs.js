export default async function handler(req, res) {
    try {
        const response = await fetch('https://www.bonsempregos.com/jobsjson', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Upstream returned ${response.status}`);
        }

        const data = await response.json();
        res.status(200).json(data);
    } catch (err) {
        console.error('Error fetching jobs:', err.message);
        res.status(500).json({ error: 'Failed to fetch jobs', details: err.message });
    }
}
