const startButton = document.querySelector("#startButton");
const video = document.querySelector("#video");
const handCanvas = document.querySelector("#handCanvas");
const targetCanvas = document.querySelector("#targetCanvas");
const audioCanvas = document.querySelector("#audioCanvas");
const gestureFeedback = document.querySelector("#gestureFeedback");
const voiceFeedback = document.querySelector("#voiceFeedback");

const handCtx = handCanvas.getContext("2d");
const targetCtx = targetCanvas.getContext("2d");
const audioCtx2d = audioCanvas.getContext("2d");

const handPath = [];
const audioLevels = [];
let stream;
let audioContext;
let analyser;
let audioData;
let animationId;

function fitCanvas(canvas) {
  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.floor(rect.width * ratio));
  canvas.height = Math.max(1, Math.floor(rect.height * ratio));
  const ctx = canvas.getContext("2d");
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  return rect;
}

function drawTarget() {
  const rect = fitCanvas(targetCanvas);
  targetCtx.clearRect(0, 0, rect.width, rect.height);
  targetCtx.lineWidth = 8;
  targetCtx.lineCap = "round";
  targetCtx.strokeStyle = "#0f766e";
  targetCtx.beginPath();
  targetCtx.moveTo(rect.width * 0.18, rect.height * 0.74);
  targetCtx.lineTo(rect.width * 0.82, rect.height * 0.26);
  targetCtx.stroke();
}

function drawHandPath() {
  const rect = fitCanvas(handCanvas);
  handCtx.clearRect(0, 0, rect.width, rect.height);

  handCtx.fillStyle = "rgba(15, 118, 110, 0.13)";
  handCtx.fillRect(0, 0, rect.width, rect.height);

  if (handPath.length < 2) return;

  handCtx.lineWidth = 7;
  handCtx.lineCap = "round";
  handCtx.lineJoin = "round";
  handCtx.strokeStyle = "#f97316";
  handCtx.beginPath();

  handPath.forEach((point, index) => {
    const x = (index / Math.max(1, handPath.length - 1)) * rect.width;
    const y = point * rect.height;
    if (index === 0) handCtx.moveTo(x, y);
    else handCtx.lineTo(x, y);
  });

  handCtx.stroke();
}

function drawAudioLevels() {
  const rect = fitCanvas(audioCanvas);
  audioCtx2d.clearRect(0, 0, rect.width, rect.height);
  audioCtx2d.lineWidth = 3;
  audioCtx2d.strokeStyle = "#2563eb";
  audioCtx2d.beginPath();

  audioLevels.forEach((level, index) => {
    const x = (index / Math.max(1, audioLevels.length - 1)) * rect.width;
    const y = rect.height - level * rect.height;
    if (index === 0) audioCtx2d.moveTo(x, y);
    else audioCtx2d.lineTo(x, y);
  });

  audioCtx2d.stroke();
}

function scoreRisingPath(points) {
  if (points.length < 30) return null;
  const first = average(points.slice(0, 10));
  const last = average(points.slice(-10));
  return first - last;
}

function average(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function updateFeedback() {
  const gestureRise = scoreRisingPath(handPath);
  if (gestureRise === null) {
    gestureFeedback.textContent = "Move your hand upward as you say ma.";
  } else if (gestureRise > 0.16) {
    gestureFeedback.textContent = "Great rising hand motion.";
  } else if (gestureRise > 0.05) {
    gestureFeedback.textContent = "Nice start. Try lifting your hand a little more.";
  } else {
    gestureFeedback.textContent = "This tone should rise. Start lower, finish higher.";
  }

  const voiceRise = scoreRisingPath(audioLevels);
  if (voiceRise === null) {
    voiceFeedback.textContent = "Speak after starting the microphone.";
  } else if (voiceRise > 0.08) {
    voiceFeedback.textContent = "Your voice energy rose. Next step: replace this with pitch tracking.";
  } else {
    voiceFeedback.textContent = "Prototype mic is reading volume now. Pitch tracking comes next.";
  }
}

function readAudio() {
  analyser.getByteTimeDomainData(audioData);
  let sum = 0;
  for (const value of audioData) {
    const centered = (value - 128) / 128;
    sum += centered * centered;
  }
  const rms = Math.sqrt(sum / audioData.length);
  audioLevels.push(Math.min(1, rms * 6));
  if (audioLevels.length > 90) audioLevels.shift();
}

function simulateHandPath() {
  if (handPath.length < 90) {
    const t = handPath.length / 89;
    handPath.push(0.78 - t * 0.48 + Math.sin(t * Math.PI * 5) * 0.018);
  } else {
    handPath.shift();
    handPath.push(0.28 + Math.sin(Date.now() / 220) * 0.03);
  }
}

function animate() {
  if (analyser) readAudio();
  simulateHandPath();
  drawHandPath();
  drawAudioLevels();
  updateFeedback();
  animationId = requestAnimationFrame(animate);
}

async function start() {
  startButton.disabled = true;
  startButton.textContent = "Starting...";

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: true,
    });

    video.srcObject = stream;

    audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    audioData = new Uint8Array(analyser.fftSize);
    source.connect(analyser);

    startButton.textContent = "Running";
    drawTarget();
    cancelAnimationFrame(animationId);
    animate();
  } catch (error) {
    startButton.disabled = false;
    startButton.textContent = "Start Camera + Mic";
    gestureFeedback.textContent = "Camera or microphone permission was not granted.";
    voiceFeedback.textContent = error.message;
  }
}

startButton.addEventListener("click", start);
window.addEventListener("resize", drawTarget);
drawTarget();
