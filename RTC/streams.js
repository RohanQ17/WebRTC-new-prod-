let APP_ID = null; // We will fetch this from our server
let TOKEN = null; // We will fetch this from our server
const CHANNEL = sessionStorage.getItem('room');
let UID = Number(sessionStorage.getItem('UID'));
let NAME = sessionStorage.getItem('name');

if (!NAME || !CHANNEL) {
    window.open('/', '_self');
}

const client = AgoraRTC.createClient({mode:'rtc', codec:'vp8'});

let localTracks = [];
let remoteUsers = {};

let joinAndDisplayLocalStream = async () => {
    document.getElementById('roomname').innerText = CHANNEL;

    client.on('user-published', handleUserJoined);
    client.on('user-left', handleUserLeft);

    try {
        // Fetch APP_ID from server
        let appIdResponse = await fetch('/api/get_app_id');
        if (!appIdResponse.ok) {
            throw new Error(`Failed to get APP_ID: ${appIdResponse.status} ${appIdResponse.statusText}`);
        }
        let appIdData = await appIdResponse.json();
        APP_ID = appIdData.app_id;
        console.log("Got APP_ID from server");

        // Fetch token from server
        let tokenResponse = await fetch(`/api/get_token?channelName=${CHANNEL}&uid=${UID}`);
        if (!tokenResponse.ok) {
            throw new Error(`Failed to get token: ${tokenResponse.status} ${tokenResponse.statusText}`);
        }
        let tokenData = await tokenResponse.json();
        TOKEN = tokenData.token;
        console.log("Got token from server");

        // Join the channel
        await client.join(APP_ID, CHANNEL, TOKEN, UID);
        console.log("Successfully joined channel");
    } catch(error) {
        console.error("Failed to join channel:", error);
        alert("Could not join the room. Please check the console for errors and ensure the server is running.");
        window.open('/', '_self');
        return;
    }
    
    try {
        localTracks = await AgoraRTC.createMicrophoneAndCameraTracks();
        console.log("Created local tracks:", localTracks);
    } catch (error) {
        console.error("Failed to get media devices:", error);
        alert("Could not access camera/microphone. Please check permissions.");
        return;
    }

    let member = await createMember();

    // Set the local video to user-1 (first video element)
    const user1Video = document.getElementById('user-1');
    if (user1Video && localTracks[1]) {
        localTracks[1].play('user-1');
        console.log("Local video track playing on user-1");
    } else {
        console.error("Could not find user-1 video element or video track");
    }
    
    await client.publish([localTracks[0], localTracks[1]]);
    console.log("Local stream published");
}

let handleUserJoined = async (user, mediaType) => {
    remoteUsers[user.uid] = user;
    await client.subscribe(user, mediaType);
    console.log(`User ${user.uid} has joined and published media.`);

    if (mediaType === 'video') {
        let member = await getMember(user);
        
        // Set the remote video to user-2 (second video element)
        const user2Video = document.getElementById('user-2');
        if (user2Video && user.videoTrack) {
            user.videoTrack.play('user-2');
            console.log("Remote video track playing on user-2");
        } else {
            console.error("Could not find user-2 video element or remote video track");
        }
    }

    if (mediaType === 'audio') {
        user.audioTrack.play();
    }
}

let handleUserLeft = async (user) => {
    console.log(`User ${user.uid} has left.`);
    delete remoteUsers[user.uid];
    
    // Clear the second video element when remote user leaves
    const user2Video = document.getElementById('user-2');
    if (user2Video) {
        // Stop the video track properly
        user2Video.srcObject = null;
        console.log("Cleared remote video");
    }
}

let leaveAndRemoveLocalStream = async () => {
    for (let i=0; localTracks.length > i; i++) {
        localTracks[i].stop();
        localTracks[i].close();
    }

    await client.leave();
    await deleteMember(); // Use await to ensure member is deleted before redirect
    window.open('/', '_self');
}

let createMember = async () => {
    try {
        let response = await fetch('/api/create_member', {
            method:'POST',
            headers: {
                'Content-Type':'application/json'
            },
            body:JSON.stringify({'name':NAME, 'room_name':CHANNEL, 'UID':UID})
        });
        if (!response.ok) throw new Error('Failed to create member');
        let member = await response.json();
        return member;
    } catch (error) {
        console.error("Error creating member:", error);
        return { name: NAME }; // Fallback
    }
}

let getMember = async (user) => {
    try {
        let response = await fetch(`/api/get_member?UID=${user.uid}&room_name=${CHANNEL}`);
        if (!response.ok) throw new Error('Failed to get member');
        let member = await response.json();
        return member;
    } catch (error) {
        console.error("Error getting member:", error);
        return { name: 'Guest' }; // Fallback
    }
}

let deleteMember = async () => {
    try {
        await fetch('/api/delete_member', {
            method:'POST',
            headers: {
                'Content-Type':'application/json'
            },
            body:JSON.stringify({'name':NAME, 'room_name':CHANNEL, 'UID':UID})
        });
    } catch (error) {
        console.error("Error deleting member:", error);
    }
}

// Global functions for HTML onclick handlers
window.toggleMicrophone = async () => {
    const audioTrack = localTracks.find(track => track.trackMediaType === 'audio');
    const micLabel = document.getElementById('mic-label');
    const micIcon = document.getElementById('toggle-mic');
    
    if (!audioTrack) {
        console.error('No audio track found');
        return;
    }
    
    if (audioTrack.muted) {
        await audioTrack.setMuted(false);
        micLabel.textContent = 'Mic On';
        micIcon.style.backgroundColor = '';
        console.log('Microphone enabled');
    } else {
        await audioTrack.setMuted(true);
        micLabel.textContent = 'Mic Off';
        micIcon.style.backgroundColor = 'rgb(255, 80, 80, 1)';
        console.log('Microphone disabled');
    }
}

window.toggleVideo = async () => {
    const videoTrack = localTracks.find(track => track.trackMediaType === 'video');
    const videoLabel = document.getElementById('video-label');
    const videoIcon = document.getElementById('video-toggle');
    
    if (!videoTrack) {
        console.error('No video track found');
        return;
    }
    
    if (videoTrack.muted) {
        await videoTrack.setMuted(false);
        videoLabel.textContent = 'Video On';
        videoIcon.style.backgroundColor = '';
        console.log('Video enabled');
    } else {
        await videoTrack.setMuted(true);
        videoLabel.textContent = 'Video Off';
        videoIcon.style.backgroundColor = 'rgb(255, 80, 80, 1)';
        console.log('Video disabled');
    }
}

window.toggleChat = () => {
    const chatContainer = document.getElementById('chat-container');
    if (chatContainer.style.display === 'none' || chatContainer.style.display === '') {
        chatContainer.style.display = 'flex';
    } else {
        chatContainer.style.display = 'none';
    }
}

window.leaveRoom = async () => {
    await leaveAndRemoveLocalStream();
}

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    // Generate a random UID for the user
    if (!sessionStorage.getItem('UID')) {
        sessionStorage.setItem('UID', String(Math.floor(Math.random() * 10000)));
    }
    UID = Number(sessionStorage.getItem('UID'));
    
    joinAndDisplayLocalStream();

    window.addEventListener("beforeunload", deleteMember);

    // Note: The toggle functions are called directly via onclick in HTML
    // so we don't need event listeners here anymore
});
