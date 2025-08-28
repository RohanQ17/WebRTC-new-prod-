import express from 'express';
import pkg from 'agora-token';
const { RtcTokenBuilder, RtcRole } = pkg;

const APP_ID = process.env.APP_ID;
const APP_CERTIFICATE = process.env.APP_CERTIFICATE;

if (!APP_ID || !APP_CERTIFICATE) {
    console.error("FATAL ERROR: APP_ID and APP_CERTIFICATE must be set in environment variables");
    process.exit(1);
}

const app = express();

// Enable CORS for all routes
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

app.use(express.json());

// In-memory store for rooms. In a real application, you would use a database.
const rooms = {};

// Endpoint to get APP_ID (safe to expose to client)
app.get('/get_app_id/', (req, res) => {
    res.json({ 'app_id': APP_ID });
});

// Endpoint to generate an Agora token
app.get('/get_token/', (req, res) => {
    const { channelName, uid } = req.query;
    if (!channelName || !uid) {
        return res.status(400).json({ 'error': 'channelName and uid are required' });
    }

    const role = RtcRole.PUBLISHER;
    const expirationTimeInSeconds = 3600; // Token valid for 1 hour
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    try {
        const token = RtcTokenBuilder.buildTokenWithUid(APP_ID, APP_CERTIFICATE, channelName, Number(uid), role, privilegeExpiredTs);
        return res.json({ 'token': token });
    } catch (e) {
        console.error("Token generation failed:", e);
        return res.status(500).json({ 'error': 'Failed to generate token' });
    }
});

app.post('/create_member/', (req, res) => {
    const { name, room_name, UID } = req.body;
    if (!rooms[room_name]) {
        rooms[room_name] = [];
    }
    const member = { name, UID };
    if (!rooms[room_name].find(m => m.UID === UID)) {
        rooms[room_name].push(member);
    }
    console.log(`Member '${name}' (UID: ${UID}) joined room '${room_name}'`);
    res.status(201).json(member);
});

app.get('/get_member/', (req, res) => {
    const { UID, room_name } = req.query;
    const room = rooms[room_name];
    if (room) {
        const member = room.find(m => m.UID == UID);
        if (member) {
            res.json(member);
        } else {
            res.status(404).send('Member not found');
        }
    } else {
        res.status(404).send('Room not found');
    }
});

app.post('/delete_member/', (req, res) => {
    const { name, room_name, UID } = req.body;
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
        res.status(200).send('Room not found, nothing to delete.');
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// For Vercel, we export the app as a handler
export default app;

