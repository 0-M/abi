# Project Architecture

**UI: Electron + Abi frontend**
 - HTML5 mediaStream
 - ????? convert into opus or WAV stream ???? 
 - Node Unix Socket communication ([docs](https://nodejs.org/api/net.html#net_class_net_socket))

↓ **Python Server** Python MQ client & Jasper wrapper
- ffmpeg([ffmpy](https://github.com/Ch00k/ffmpy)) opus>wav ([docs](http://ffmpy.readthedocs.io/en/latest/examples.html#transcoding))↓
- wav>PyAudio ([SO post on how to do this with a stream](http://stackoverflow.com/questions/32480393/pyaudio-recording-audio-from-streaming-python)) ↓

↓ **AI: [Jasper](https://github.com/jasperproject/jasper-client)**

↓ **Python Server** Python MQ client & Jasper wrapper
- [PyZMQ (zeroMQ Python binding)](https://github.com/zeromq/pyzmq)

↓ **MQ: [zeroMQ](http://zeromq.org/intro:get-the-software)**

↟ **Back** to Abi/Electron frontend
- [JSMQ (zeroMQ JS binding)](https://github.com/zeromq/JSMQ)
