const WebSocket = require('ws');

const url = 'ws://172.20.10.198:18777/sipassign?client_id=3181&agent=alok&extentype=webrtcagent';
const ws = new WebSocket(url);

ws.on('open', function open() {
  console.log('Connected to the server');

  // You can send a message to the server here if needed
  // ws.send('Your message here');
});

ws.on('message', function incoming(data) {
  console.log('Received:', data);
});

ws.on('close', function close() {
  console.log('Disconnected from the server');
});

ws.on('error', function error(err) {
  console.error('Error occurred:', err);
});
