import { WebSocket, WebSocketServer } from "ws";


const wss = new WebSocketServer({port:8080});

interface RtcWs {
    senderSocket?: null | WebSocket
    receiverSocket?: null | WebSocket
}

const roomSocketsMap  = new Map<string, RtcWs>();

wss.on('connection', (ws) => {
    ws.on('error' , console.error);

    ws.on('message', (data:any)=>{
        const message = JSON.parse(data);
        const roomId = message.RoomId;
        let senderSocket: null | WebSocket | undefined = null;
        let receiverSocket: null | WebSocket | undefined = null;

        if(!roomSocketsMap.get(roomId)){
            roomSocketsMap.set(roomId, {senderSocket:null, receiverSocket:null})
        }
        else{
            if(roomSocketsMap.get(roomId)?.senderSocket){
                senderSocket = roomSocketsMap.get(roomId)?.senderSocket   
            }

            if(roomSocketsMap.get(roomId)?.receiverSocket){
                receiverSocket = roomSocketsMap.get(roomId)?.receiverSocket;
            }
        }
        if(message.type === 'sender'){   
            senderSocket = ws;
            console.log('Setting ws to sender');
            
            roomSocketsMap.set(roomId, {senderSocket:ws, receiverSocket: roomSocketsMap.get(roomId)?.receiverSocket})
        }else if(message.type === 'receiver'){
            receiverSocket = ws;
            console.log('Setting ws to receiver');
              
            roomSocketsMap.set(roomId, {receiverSocket:ws, senderSocket: roomSocketsMap.get(roomId)?.senderSocket})
        }else if(message.type === 'createAnswer'){
            if(ws !== senderSocket){
                return;
            }
            console.log('Sending createAnswer to the receiverSocket');
            
            receiverSocket?.send(JSON.stringify({type: 'createAnswer', sdp:message.sdp, roomId}));
        }else if(message.type === 'createOffer'){
            if(ws !== receiverSocket){
                console.log('error While sending the Offer');
                return;
            }
            console.log('Sending createOffer to the sender');
            
            senderSocket?.send(JSON.stringify({type: 'createOffer', sdp:message.sdp, roomId}))
        }else if (message.type === 'iceCandidate') {
            if(ws === senderSocket){
                console.log('Sending iceCandidate to the receiverSocket');
                receiverSocket?.send(JSON.stringify({type:'iceCandidate', candidate:message.candidate, roomId }))
            }
            else if(ws === receiverSocket){
                console.log('Sending iceCandidate to the senderSocket');
                senderSocket?.send(JSON.stringify({type:'iceCandidate', candidate:message.candidate, roomId}))
            }
        }else if(message.type === 'draw'){
            if(ws === senderSocket){
                console.log('draw message send to the receiver');
                
                receiverSocket?.send(JSON.stringify({type:'draw', currentPoint:message.currentPoint, prevPoint: message.prevPoint, color: message.color, lineWidth:message.lineWidth }))
            }else if(ws === receiverSocket){
                console.log('draw message send to sender');
                
                senderSocket?.send(JSON.stringify({type:'draw', currentPoint:message.currentPoint, prevPoint: message.prevPoint, color: message.color, lineWidth:message.lineWidth }))
            }
        }else if(message.type === 'clear'){
            if(ws === senderSocket){
                console.log('draw message send to the receiver');
                
                receiverSocket?.send(JSON.stringify({type:'clear'}))
            }else if(ws === receiverSocket){
                console.log('draw message send to sender');
                
                senderSocket?.send(JSON.stringify({type:'clear'}))
            }
        }
    });
    
})

console.log('WebSocket Connection established successfully!!!');