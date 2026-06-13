const video = document.getElementById('webcam');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Set up webcam
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    video.srcObject = stream;
  })
  .catch(err => {
    console.error('Webcam error:', err);
  });

// Wait for video to know its real dimensions
video.addEventListener('loadedmetadata', () => {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  requestAnimationFrame(drawFrame);
});

function drawFrame() {
  // Draw the current video frame onto the canvas
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Define the two zones
  const topZone = {
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height / 2
  };

  const bottomZone = {
    x: 0,
    y: canvas.height / 2,
    width: canvas.width,
    height: canvas.height / 2
  };



  requestAnimationFrame(drawFrame);
}

