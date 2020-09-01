const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const errorDiv = document.createElement('div');
const myVideo = document.createElement('video');
const peer = new Peer(undefined, {
  path: '/peerjs',
  host: '/',
  port: '443',
});
// 기본 벙어리 설정
myVideo.muted = true;

// ! 읽기 전용 속성
// * 카메라, 마이크, 화면 공유와 같이 현재 연결된 미디어 입력 장치에 접근할 수 있는 객체를 반환
let myVideoStream;

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
    addNoVideo();
  });

// ! socket
peer.on('open', (id) => {
  socket.emit('join-room', ROOM_ID, id);
});

// ! custom function
// ? 함수의 위치가 달라졌을 때 왜 작동을 안 하는지 확인
const connectToNewUser = (userId, stream) => {
  const call = peer.call(userId, stream);
  const video = document.createElement('video');
  call.on('stream', (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
};

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });
  videoGrid.append(video);
};

const addNoVideo = () => {
  const div = document.createElement('div');
  div.innerText = '캠 없어요';
  div.style.cssText = 'text-align:center; height: 300px;width: 400px;object-fit: cover; background-color: green';
  videoGrid.append(div);
};

const scrollToBottom = () => {
  var d = $('.main__chat_window');
  d.scrollTop(d.prop('scrollHeight'));
};

let msg = $('input');
$('html').keydown((e) => {
  if (e.which == 13 && msg.val().length !== 0) {
    socket.emit('message', msg.val());
    msg.val('');
  }
});

socket.on('create-message', (message) => {
  $('.messages').append(`<li class="message"><b>User</b><br/>${message}</li>`);
});

// Mute button
const muteToggle = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
};

const setUnmuteButton = () => {
  const html = `   
        <i class="unmute fas fa-microphone-slash"></i>
        <span>Unmute</span>
        `;
  document.querySelector('.main__mute_button').innerHTML = html;
};
const setMuteButton = () => {
  const html = `   
        <i class="fas fa-microphone"></i>
        <span>Mute</span>
        `;
  document.querySelector('.main__mute_button').innerHTML = html;
};

const playStop = () => {
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    setStopVideo();
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
};

const setPlayVideo = () => {
  const html = `
        <i class="stop fas fa-video-slash"></i>
        <span>Play Video</span>
    `;
  document.querySelector('.main__video_button').innerHTML = html;
};
const setStopVideo = () => {
  const html = `
        <i class="fas fa-video"></i>
        <span>Stop Video</span>
    `;
  document.querySelector('.main__video_button').innerHTML = html;
};
