"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const wss = new ws_1.WebSocketServer({ port: 8080 });
const roomSocketsMap = new Map();
wss.on('connection', (ws) => {
    ws.on('error', console.error);
    ws.on('message', (data) => {
        var _a, _b, _c, _d, _e, _f;
        const message = JSON.parse(data);
        const roomId = message.RoomId;
        let senderSocket = null;
        let receiverSocket = null;
        if (!roomSocketsMap.get(roomId)) {
            roomSocketsMap.set(roomId, { senderSocket: null, receiverSocket: null });
        }
        else {
            if ((_a = roomSocketsMap.get(roomId)) === null || _a === void 0 ? void 0 : _a.senderSocket) {
                senderSocket = (_b = roomSocketsMap.get(roomId)) === null || _b === void 0 ? void 0 : _b.senderSocket;
            }
            if ((_c = roomSocketsMap.get(roomId)) === null || _c === void 0 ? void 0 : _c.receiverSocket) {
                receiverSocket = (_d = roomSocketsMap.get(roomId)) === null || _d === void 0 ? void 0 : _d.receiverSocket;
            }
        }
        if (message.type === 'sender') {
            senderSocket = ws;
            console.log('Setting ws to sender');
            roomSocketsMap.set(roomId, { senderSocket: ws, receiverSocket: (_e = roomSocketsMap.get(roomId)) === null || _e === void 0 ? void 0 : _e.receiverSocket });
        }
        else if (message.type === 'receiver') {
            receiverSocket = ws;
            console.log('Setting ws to receiver');
            roomSocketsMap.set(roomId, { receiverSocket: ws, senderSocket: (_f = roomSocketsMap.get(roomId)) === null || _f === void 0 ? void 0 : _f.senderSocket });
        }
        else if (message.type === 'createAnswer') {
            if (ws !== senderSocket) {
                return;
            }
            console.log('Sending createAnswer to the receiverSocket');
            receiverSocket === null || receiverSocket === void 0 ? void 0 : receiverSocket.send(JSON.stringify({ type: 'createAnswer', sdp: message.sdp, roomId }));
        }
        else if (message.type === 'createOffer') {
            if (ws !== receiverSocket) {
                console.log('error While sending the Offer');
                return;
            }
            console.log('Sending createOffer to the sender');
            senderSocket === null || senderSocket === void 0 ? void 0 : senderSocket.send(JSON.stringify({ type: 'createOffer', sdp: message.sdp, roomId }));
        }
        else if (message.type === 'iceCandidate') {
            if (ws === senderSocket) {
                console.log('Sending iceCandidate to the receiverSocket');
                receiverSocket === null || receiverSocket === void 0 ? void 0 : receiverSocket.send(JSON.stringify({ type: 'iceCandidate', candidate: message.candidate, roomId }));
            }
            else if (ws === receiverSocket) {
                console.log('Sending iceCandidate to the senderSocket');
                senderSocket === null || senderSocket === void 0 ? void 0 : senderSocket.send(JSON.stringify({ type: 'iceCandidate', candidate: message.candidate, roomId }));
            }
        }
    });
});
console.log('WebSocket Connection established successfully!!!');
