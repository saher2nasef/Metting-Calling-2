let client = AgoraRTC.createClient({
  mode: "rtc",
  codec: "vp8",
});

let config = {
  AppId: "aaecce764c8d43339b4ce51dda79f134",
  Token:
    "007eJxTYOh7ZXyYPXxG4r/J+2Utel4q7VC+v4vj0CaPG7naz9tLbx5QYEhMTE1OTjU3M0m2SDExNja2TDJJTjU1TElJNLdMMzQ2mdh2LKUhkJFhxk5HVkYGCATxWRh8EzPzGBgA7p4hwg==",
  uid: null,
  Channel: "Main",
};

let LocalTracks = {
  AudioTracks: null,
  VideoTracks: null,
};

let RemoteTracks = {};

// Get All Objects Form DOM

const JoinBtn = document.getElementById("JoinBtn");
const usersStreams = document.getElementById("users-streams");
JoinBtn.addEventListener("click", async () => {
  JoinBtn.remove();
  await joinStreams();
});

let joinStreams = async () => {
  client.on("user-published", HandleUserJoin);
  client.on("user-left", HandleUserLeft);

  [
    config.uid,
    LocalTracks.AudioTracks,
    LocalTracks.VideoTracks,
  ] = await Promise.all([
    client.join(config.AppId, config.Channel, config.Token, config.uid || null),
    AgoraRTC.createMicrophoneAudioTrack(),
    AgoraRTC.createCameraVideoTrack(),
  ]);

  let VideoPlayer = `
  <div class="video-containers" id="video-wrapper-${config.uid}">
    <p class="user-uid">${config.uid}</p>
    <div class="video-player player" id="stream-${config.uid}"></div>
  </div>
  `;
  usersStreams.insertAdjacentHTML("beforeend", VideoPlayer);

  console.log(LocalTracks.VideoTracks);
  LocalTracks.VideoTracks.play(`stream-${config.uid}`);

  await client.publish([LocalTracks.AudioTracks, LocalTracks.VideoTracks]);
};
let HandleUserLeft = async (user) => {
  document.getElementById(`video-wrapper-${user.uid}`).remove();
};

let HandleUserJoin = async (user, MediaType) => {
  RemoteTracks[user.uid] = user;
  await client.subscribe(user, MediaType);
  console.clear();
  if (MediaType === "video") {
    let VideoPlayer = `
    <div class="video-containers" id="video-wrapper-${user.uid}">
      <p class="user-uid">${user.uid}</p>
      <div class="video-player player" id="stream-${user.uid}"></div>
    </div>
    `;
    usersStreams.insertAdjacentHTML("beforeend", VideoPlayer);
    user.videoTrack.play(`stream-${user.uid}`);
  }
  if (MediaType === "audio") {
    user.audioTrack.play();
  }
};

// #########################################
const CameraBtn = document.getElementById("CameraBtn");
let ShowCamera = true;
const MicBtn = document.getElementById("MicBtn");
let IsMute = false;
const LeaveBtn = document.getElementById("LeaveBtn");
CameraBtn.addEventListener("click", () => {
  if (ShowCamera) {
    ShowCamera = false;
    CameraBtn.classList.add("Camera");
    console.log("Camera No");
  } else {
    ShowCamera = true;
    CameraBtn.classList.remove("Camera");
    console.log("Camera Yes");
  }
});
MicBtn.addEventListener("click", () => {
  if (IsMute) {
    IsMute = false;
    MicBtn.classList.remove("Mute");
    console.log("Mute Yes");
  } else {
    IsMute = true;
    MicBtn.classList.add("Mute");
    console.log("Mute No");
  }
});
LeaveBtn.addEventListener("click", () => {
  console.log("LeaveBtn");
});
