// In-memory store for rooms (Note: In production, use a database like Redis or MongoDB)
let rooms = {};

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

    const { UID, room_name } = req.query;
    
    if (!UID || !room_name) {
        return res.status(400).json({ error: 'UID and room_name are required' });
    }

    const room = rooms[room_name];
    if (room) {
        const member = room.find(m => m.UID == UID);
        if (member) {
            res.json(member);
        } else {
            res.status(404).json({ error: 'Member not found' });
        }
    } else {
        res.status(404).json({ error: 'Room not found' });
    }
}
