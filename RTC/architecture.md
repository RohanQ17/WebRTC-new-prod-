# WebRTC Architecture Overview

## Introduction

This document outlines the architecture and flow of a WebRTC (Web Real-Time Communication) application that enables peer-to-peer video communication entirely within the browser environment.

## Key Concepts

### Browser-Based Implementation
- **Client-Side Only**: The entire application runs in the browser without requiring server-side media processing
- **Direct P2P Connection**: Establishes direct peer-to-peer connections between clients
- **No Media Storage**: The server doesn't store or process video data - it only facilitates connection establishment

### Media Acquisition
- **getUserMedia (GUM)**: Browser API that provides access to:
  - Camera feed
  - Microphone input
  - Screen sharing capabilities

### Protocol Choice: UDP vs TCP
- **WebRTC uses UDP (User Datagram Protocol)**
  - **Why UDP?** Optimized for real-time communication where speed is prioritized over reliability
  - **Faster transmission** with lower latency
  - **Acceptable data loss** for live media (a few dropped frames won't significantly impact user experience)
- **TCP Alternative**
  - More reliable but slower due to acknowledgment and retransmission mechanisms
  - Not suitable for real-time media streaming

## WebRTC Connection Flow

### 1. Peer Connection Setup
After obtaining media access via getUserMedia, create a WebRTC peer connection object.

### 2. NAT Traversal Challenge
- **Problem**: Direct IP address sharing is impossible due to:
  - **NAT (Network Address Translation)**: Devices behind routers don't have public IP addresses
  - **Firewalls**: Block direct incoming connections for security
- **Solution**: STUN servers help discover the public-facing IP and port

### 3. STUN Servers & ICE Candidates
- **STUN (Session Traversal Utilities for NAT)**: Google provides public STUN servers
- **ICE Candidates**: STUN servers return ICE (Interactive Connectivity Establishment) candidates
- **Purpose**: These candidates tell other devices how to reach your client through the network infrastructure

### 4. Media Track Addition
Add media tracks (audio/video streams) from getUserMedia to the peer connection.

### 5. Offer Creation & Local Description
- **SDP (Session Description Protocol)**: Describes how to handle media (codecs, formats, etc.)
- **Offer**: Contains SDP with type "offer"
- **Local Description**: Set the offer as the local description for Client A

### 6. Signaling Server Role
- **Not part of WebRTC specification**: A separate communication channel needed for coordination
- **Uses TCP/WebSockets**: Unlike the media stream which uses UDP
- **Purpose**: Facilitates exchange of offers, answers, and ICE candidates between clients

### 7. Offer & ICE Candidate Exchange
Client A sends the following to Client B via the signaling server:
- SDP offer
- ICE candidates (connection information)

### 8. Answer Processing
Client B performs the following steps:
- Receives the offer from Client A
- Sets the received offer as remote description
- Creates an answer (similar to offer but with type "answer")
- Sets the answer as local description

### 9. Answer Exchange
Client B sends the answer back to Client A through the signaling server.

### 10. Connection Establishment
- Client A receives the answer and sets it as remote description
- **Signaling server's job is complete** at this point
- **Direct UDP connection established** between the two clients
- **Media streaming begins** directly between peers

## Connection States

```
[Client A] ←→ [Signaling Server] ←→ [Client B]
    ↓              (WebSocket/TCP)           ↓
    └─────────── Direct UDP Connection ──────┘
                  (Media Streaming)
```

## Benefits of This Architecture

1. **Scalability**: Server load doesn't increase with media quality or duration
2. **Privacy**: Media streams don't pass through servers
3. **Low Latency**: Direct peer-to-peer communication
4. **Cost Effective**: Minimal server resources required (only for signaling)

## Technical Stack Summary

- **Media Acquisition**: getUserMedia API
- **P2P Connection**: WebRTC PeerConnection
- **Network Discovery**: STUN servers
- **Signaling**: WebSocket server (TCP)
- **Media Transport**: UDP (direct peer-to-peer)
- **Session Description**: SDP protocol