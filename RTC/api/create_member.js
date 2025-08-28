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

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { name, room_name, UID } = req.body;
    
    if (!name || !room_name || !UID) {
        return res.status(400).json({ error: 'name, room_name, and UID are required' });
    }

    if (!rooms[room_name]) {
        rooms[room_name] = [];
    }
    
    const member = { name, UID };
    if (!rooms[room_name].find(m => m.UID === UID)) {
        rooms[room_name].push(member);
    }
    
    console.log(`Member '${name}' (UID: ${UID}) joined room '${room_name}'`);
    res.status(201).json(member);
}
