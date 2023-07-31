try {
  let client = AgoraRTC.createClient({
    mode: "rtc",
    codec: "vp8",
  });
  const CameraBtn = document.getElementById("CameraBtn");
  const IfJoined = document.getElementById("IfJoined");
  const Loading = document.getElementById("Loading");
  let ShowCamera = true;
  const MicBtn = document.getElementById("MicBtn");
  let IsMute = false;
  const LeaveBtn = document.getElementById("LeaveBtn");
  const Messages = document.getElementById("Messages");
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
    JoinBtn.style.display = "none";
    Loading.style.display = "block";
    Messages.style.display = "none";
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
      client.join(
        config.AppId,
        config.Channel,
        config.Token,
        config.uid || null
      ),
      AgoraRTC.createMicrophoneAudioTrack(),
      AgoraRTC.createCameraVideoTrack(),
    ]);

    let VideoPlayer = `
  <div class="video-containers" id="video-wrapper-${config.uid}">
    <p class="user-uid">You</p>
    <div class="video-player player" id="stream-${config.uid}"></div>
  </div>
  `;
    usersStreams.insertAdjacentHTML("beforeend", VideoPlayer);

    LocalTracks.VideoTracks.play(`stream-${config.uid}`);
    IfJoined.style.display = "block";
    Loading.style.display = "none";
    await client.publish([LocalTracks.AudioTracks, LocalTracks.VideoTracks]);
  };
  let HandleUserLeft = async (user) => {
    document.getElementById(`video-wrapper-${user.uid}`).remove();
  };

  let HandleUserJoin = async (user, MediaType) => {
    console.log(user);
    RemoteTracks[user.uid] = user;
    await client.subscribe(user, MediaType);

    let arraysOfuid = [];
    if (MediaType === "video") {
      document.querySelectorAll(".video-containers").forEach((element) => {
        arraysOfuid.push(Number(element.id.substring(14, element.id.length)));
      });
      if (!arraysOfuid.includes(user.uid)) {
        let VideoPlayer = `
      <div class="video-containers" id="video-wrapper-${user.uid}">
      <p class="user-uid">${user.uid}</p>
      <div class="video-player player" id="stream-${user.uid}"></div>
      </div>
      `;
        usersStreams.insertAdjacentHTML("beforeend", VideoPlayer);
        user.videoTrack.play(`stream-${user.uid}`);
      } else {
        document.getElementById(`video-wrapper-${user.uid}`).remove();
        let VideoPlayer = `
      <div class="video-containers" id="video-wrapper-${user.uid}">
      <p class="user-uid">${user.uid}</p>
      <div class="video-player player" id="stream-${user.uid}"></div>
      </div>
      `;
        usersStreams.insertAdjacentHTML("beforeend", VideoPlayer);
        user.videoTrack.play(`stream-${user.uid}`);
      }
    }
    if (MediaType === "audio") {
      user.audioTrack.play();
    }
  };

  // #########################################

  CameraBtn.addEventListener("click", () => {
    if (ShowCamera) {
      ShowCamera = false;
      CameraBtn.classList.add("Camera");
      LocalTracks.VideoTracks.setMuted(true);
    } else {
      ShowCamera = true;
      CameraBtn.classList.remove("Camera");
      LocalTracks.VideoTracks.setMuted(false);
    }
  });
  MicBtn.addEventListener("click", () => {
    if (IsMute) {
      IsMute = false;
      MicBtn.classList.remove("Mute");
      LocalTracks.AudioTracks.setMuted(false);
    } else {
      IsMute = true;
      MicBtn.classList.add("Mute");
      LocalTracks.AudioTracks.setMuted(true);
    }
  });
  LeaveBtn.addEventListener("click", async () => {
    usersStreams.innerHTML = "";
    IfJoined.style.display = "none";
    await client.leave();
    location.href = location.origin;
  });
} catch (error) {
  location.reload();
}
