const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { v4: uuidV4 } = require('uuid');
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, { debug: true });

// set or middleware
app.set('view engine', 'ejs');
app.use(express.static('public'));

// routes
app.use('/peerjs', peerServer);

app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`);
});
app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room });
});

// * 소켓 연결
io.on('connection', (socket) => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId); // 그룹에 입장
    socket.to(roomId).broadcast.emit('user-connected', userId); // 나를 제외한 그룹 전체에 전달
  });
});

server.listen(3030, () => {
  console.log('server start');
});
