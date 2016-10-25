
var net = require('net');

var recorder = null;
var volume = null;
var audioInput = null;
var sampleRate = null;
var audioContext = null;
var context = null;
var outputElement = document.getElementById('output');
var outputString;
var bufferSize = 2048;

var mediaSourceIn;

function audioReceiver(e) {
    // creates Socket
    mediaSourceIn = e;
    initSocket();
}

function createRecordingTask() {
  // creates the audio context
    audioContext = window.AudioContext || window.webkitAudioContext;
    context = new audioContext();

    // retrieve the current sample rate to be used for WAV packaging
    sampleRate = context.sampleRate;

    // creates a gain node
    volume = context.createGain();

    // creates an audio node from the microphone incoming stream
    audioInput = context.createMediaStreamSource(mediaSourceIn);

    // connect the stream to the gain node
    audioInput.connect(volume);

    /* From the spec: This value controls how frequently the audioprocess event is
    dispatched and how many sample-frames need to be processed each call.
    Lower values for buffer size will result in a lower (better) latency.
    Higher values will be necessary to avoid audio breakup and glitches */
    recorder = context.createScriptProcessor(bufferSize, 2, 2);

    recorder.onaudioprocess = function(e){
        console.log ('recording');
        var left = e.inputBuffer.getChannelData (0);
        var right = e.inputBuffer.getChannelData (1);
        var bf = createAudioBuffer(
          new Float32Array (left),
          new Float32Array (right));

        upload(bf);
    }

    // we connect the recorder
    volume.connect (recorder);
    recorder.connect (context.destination);
}

function mergeBuffers(channelBuffer){
  var result = new Float32Array(bufferSize);
  result.set(channelBuffer); // make a copy?
  return result;
}

function interleave(leftChannel, rightChannel){
  var length = leftChannel.length + rightChannel.length;
  var result = new Float32Array(length);

  var inputIndex = 0;

  for (var index = 0; index < length; ){
    result[index++] = leftChannel[inputIndex];
    result[index++] = rightChannel[inputIndex];
    inputIndex++;
  }
  return result;
}

function writeUTFBytes(view, offset, string){
  var lng = string.length;
  for (var i = 0; i < lng; i++){
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function createAudioBuffer(leftchannel, rightchannel) {
  // we flat the left and right channels down
  var leftBuffer = mergeBuffers ( leftchannel, bufferSize );
  var rightBuffer = mergeBuffers ( rightchannel, bufferSize );
  // we interleave both channels together
  var interleaved = interleave ( leftBuffer, rightBuffer );

  // we create our wav file
  var buffer = new ArrayBuffer(44 + interleaved.length * 2);
  var view = new DataView(buffer);

  // RIFF chunk descriptor
  writeUTFBytes(view, 0, 'RIFF');
  view.setUint32(4, 44 + interleaved.length * 2, true);
  writeUTFBytes(view, 8, 'WAVE');
  // FMT sub-chunk
  writeUTFBytes(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  // stereo (2 channels)
  view.setUint16(22, 2, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 4, true);
  view.setUint16(32, 4, true);
  view.setUint16(34, 16, true);
  // data sub-chunk
  writeUTFBytes(view, 36, 'data');
  view.setUint32(40, interleaved.length * 2, true);

  // write the PCM samples
  var lng = interleaved.length;
  var index = 44;
  var volume = 1;
  for (var i = 0; i < lng; i++){
      view.setInt16(index, interleaved[i] * (0x7FFF * volume), true);
      index += 2;
  }

  // our final binary blob
  //var blob = new Blob ( [ view ], { type : 'audio/wav' } );
  return Buffer.from(view.buffer);
}

var audioSocket;
function initSocket() {
  audioSocket = net.connect('/tmp/abi_audio_input', connected)
  .catch(function(err) {
    console.log("Could not connect...");
    console.log(err);
  });
}

function connected() {
  console.log("YOUR UNIX SOCKET HAS SUCCESSFULLY BEEN CONNECTED TO!");
  audioSocket = this;
  createRecordingTask();
}

function upload(thatAudio) {

  if (audioSocket.writable) {
    console.log("sending...");
    audioSocket.write(thatAudio);
  } else {
    console.log("DAT SHIT AINT WRITABLE");
  }

  /*
  var xhr = new XMLHttpRequest();
  xhr.open('POST', './upload.php', true);
  xhr.onload = function(e) {};
  // Listen to the upload progress.
  // assuming you have a progress element on your dom
  var progressBar = document.querySelector('progress');
  xhr.upload.onprogress = function(e) {
    if (e.lengthComputable) {
      progressBar.value = (e.loaded / e.total) * 100;
      progressBar.textContent = progressBar.value; // Fallback for unsupported browsers.
    }
  };

  xhr.send(blobOrFile);*/
}


module.exports = audioReceiver ;
