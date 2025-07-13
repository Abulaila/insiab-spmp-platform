const WebSocket = require('ws');

// Create WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

// Store connected clients and their data
const clients = new Map();
const presenceUsers = new Map();

console.log('WebSocket server started on port 8080');

wss.on('connection', (ws, req) => {
    const clientId = `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`Client connected: ${clientId}`);
    
    clients.set(ws, {
        id: clientId,
        lastSeen: Date.now()
    });

    // Send welcome message
    ws.send(JSON.stringify({
        type: 'connection_established',
        clientId: clientId
    }));

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            handleMessage(ws, data);
        } catch (error) {
            console.error('Failed to parse message:', error);
        }
    });

    ws.on('close', () => {
        const clientData = clients.get(ws);
        if (clientData) {
            console.log(`Client disconnected: ${clientData.id}`);
            
            // Remove from presence
            presenceUsers.delete(clientData.id);
            broadcastPresenceUpdate();
            
            clients.delete(ws);
        }
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

function handleMessage(ws, data) {
    const clientData = clients.get(ws);
    if (!clientData) return;

    switch (data.type) {
        case 'ping':
            ws.send(JSON.stringify({ type: 'pong' }));
            break;

        case 'presence_update':
            handlePresenceUpdate(clientData.id, data.user);
            break;

        case 'collaboration_event':
            handleCollaborationEvent(data.event);
            break;

        default:
            console.log('Unknown message type:', data.type);
    }
}

function handlePresenceUpdate(clientId, userData) {
    presenceUsers.set(clientId, {
        ...userData,
        id: clientId,
        lastSeen: Date.now()
    });
    
    broadcastPresenceUpdate();
}

function handleCollaborationEvent(event) {
    // Broadcast collaboration event to all connected clients
    const message = JSON.stringify({
        type: 'collaboration_event',
        event: event
    });

    clients.forEach((clientData, ws) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(message);
        }
    });
}

function broadcastPresenceUpdate() {
    const users = Array.from(presenceUsers.values());
    const message = JSON.stringify({
        type: 'presence_update',
        users: users
    });

    clients.forEach((clientData, ws) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(message);
        }
    });
}

// Clean up inactive users every 30 seconds
setInterval(() => {
    const now = Date.now();
    const timeout = 60000; // 1 minute timeout

    presenceUsers.forEach((user, userId) => {
        if (now - user.lastSeen > timeout) {
            presenceUsers.delete(userId);
        }
    });

    // Remove disconnected clients
    clients.forEach((clientData, ws) => {
        if (ws.readyState !== WebSocket.OPEN) {
            clients.delete(ws);
            presenceUsers.delete(clientData.id);
        }
    });

    broadcastPresenceUpdate();
}, 30000);

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Shutting down WebSocket server...');
    wss.close(() => {
        console.log('WebSocket server closed');
        process.exit(0);
    });
});