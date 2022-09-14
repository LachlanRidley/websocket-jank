const express = require('express')
const app = express()
const port = 3000
const ws = require('ws')

let clientId = 1;
let mice = {
    
}

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use(express.static('public'))

const wsServer = new ws.Server({ noServer: true });
wsServer.on('connection', socket => {
    socket.on('message', message => {
        const messageAsString = message.toString();
        if (messageAsString === "register") {
            mice[clientId] = { x: 0, y: 0 }
            socket.send(clientId);

            clientId++;
        } else {
            const coords = JSON.parse(messageAsString);
            console.log({ clientId: coords.clientId, x: coords.x, y: coords.y })
            
            mice[coords.clientId] = coords;

            wsServer.clients.forEach(client => {
                client.send(JSON.stringify(Object.values(mice)));
            })
        }        
    });
})

const server = app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
server.on('upgrade', (request, socket, head) => {
    wsServer.handleUpgrade(request, socket, head, socket => {
        wsServer.emit('connection', socket, request);
    });
});
