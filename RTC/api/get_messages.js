// In-memory store for messages (Note: In production, use a database like Redis or MongoDB)
// This is a temporary solution and messages will be lost on serverless function cold starts
let messages = {};

export default function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { room_name } = req.query;
    
    if (!room_name) {
        return res.status(400).json({ error: 'room_name is required' });
    }

    res.json({ messages: messages[room_name] || [] });
}
