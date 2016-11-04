import socket
import os
import pyaudio
from threading import Thread

sockfile = "/tmp/audio_input"

FORMAT = pyaudio.paInt16
CHUNK = 1024
CHANNELS = 2
RATE = 44100
frames = []

if os.path.exists(sockfile):
    os.remove(sockfile)

print("Opening socket...")
server = socket.socket( socket.AF_UNIX, socket.SOCK_STREAM )
server.bind(sockfile)
server.listen(5)
conn, addr = server.accept()

print("Creating PyAudio stream...")
p = pyaudio.PyAudio()

stream = p.open(format=FORMAT,
                channels = CHANNELS,
                rate = RATE,
                output = True,
                frames_per_buffer = CHUNK,
                )

print "Listening..."
singleChunkSizeBytes = (CHUNK * CHANNELS*2)
print singleChunkSizeBytes, "bytes at a time"
while True:
    soundData = conn.recv(singleChunkSizeBytes)
    if soundData:
        stream.write(soundData, CHUNK, exception_on_underflow=True)

server.close()
os.remove( sockfile )
