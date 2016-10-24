// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

var constraints = { audio: true, video: false };
navigator.mediaDevices.getUserMedia(constraints).then(function(mediaStream) {
  /* use the stream */
  console.log(mediaStream);
  var audio = document.querySelector('audio');
  // Older browsers may not have srcObject
  audio.src = window.URL.createObjectURL(mediaStream);
  audio.onloadedmetadata = function(e) {
    audio.play();
  };
}).catch(function(err) {
  /* handle the error */
  console.log("LET ME USE THE DAMN MIC!!!!");
});
