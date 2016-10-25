// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

var audioReceiver = require('./audio-sender');

var constraints = { audio: true, video: false };
navigator.mediaDevices.getUserMedia(constraints)
  .then(audioReceiver)
  .catch(function(err) {
    /* handle the error */
    console.log("LET ME USE THE DAMN MIC!!!!");
  }
);
