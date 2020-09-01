const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const errorDiv = document.createElement('div');
const myVideo = document.createElement('video');
const peer = new Peer(undefined, {
  path: '/peerjs',
  host: '/',
  port: '3030',
});

// 기본 벙어리 설정
myVideo.muted = true;

let myVideoStream;

// ! 읽기 전용 속성
// * 카메라, 마이크, 화면 공유와 같이 현재 연결된 미디어 입력 장치에 접근할 수 있는 객체를 반환
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on('call', (call) => {
      call.answer(stream);
      const video = document.createElement('video');
      call.on('stream', (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on('user-connected', (userId) => {
      connectToNewUser(userId, stream);
    });
  })
  .catch((err) => {
    errorDiv.innerText = '웹 캠을 찾을 수 없어요!';
    videoGrid.append(errorDiv);
  });

// ! socket
peer.on('open', (id) => {
  socket.emit('join-room', ROOM_ID, id);
});

// ! custom function
const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });
  videoGrid.append(video);
};

const connectToNewUser = (userId, stream) => {
  const call = peer.call(userId, stream);
  const video = document.createElement('video');
  call.on('stream', (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
};
