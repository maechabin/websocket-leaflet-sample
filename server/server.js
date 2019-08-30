const Server = require('ws').Server;
const server = new Server({ port: 5001 });

server.on('connection', ws => {
  ws.on('message', message => {
    console.log('Received: ' + message);

    server.clients.forEach(client => {
      client.send(message);
    });
  });

  ws.on('close', () => {
    console.log('I lost a client');
  });
});

console.log('WS Server is running: ws://localhost:5001');
