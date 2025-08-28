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

    const room = rooms[room_name];
    if (room) {
        const initialLength = room.length;
        rooms[room_name] = room.filter(m => m.UID != UID);
        if (rooms[room_name].length < initialLength) {
            console.log(`Member '${name}' (UID: ${UID}) left room '${room_name}'`);
        }
        if (rooms[room_name].length === 0) {
            delete rooms[room_name];
            console.log(`Room '${room_name}' is now empty and has been deleted.`);
        }
        res.json({ message: 'Member deleted' });
    } else {
        res.status(200).json({ message: 'Room not found, nothing to delete.' });
    }
}
