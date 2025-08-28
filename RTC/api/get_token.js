import pkg from 'agora-token';
const { RtcTokenBuilder, RtcRole } = pkg;

const APP_ID = process.env.APP_ID;
const APP_CERTIFICATE = process.env.APP_CERTIFICATE;

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

    if (!APP_ID || !APP_CERTIFICATE) {
        return res.status(500).json({ error: 'Agora credentials not configured' });
    }

    const { channelName, uid } = req.query;
    if (!channelName || !uid) {
        return res.status(400).json({ 'error': 'channelName and uid are required' });
    }

    const role = RtcRole.PUBLISHER;
    const expirationTimeInSeconds = 3600; // Token valid for 1 hour
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    try {
        const token = RtcTokenBuilder.buildTokenWithUid(
            APP_ID, 
            APP_CERTIFICATE, 
            channelName, 
            Number(uid), 
            role, 
            privilegeExpiredTs
        );
        return res.json({ 'token': token });
    } catch (e) {
        console.error("Token generation failed:", e);
        return res.status(500).json({ 'error': 'Failed to generate token' });
    }
}
