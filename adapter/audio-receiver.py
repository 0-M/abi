import socket
import os
import pyaudio
from threading import Thread

sockfile = "/tmp/abi_audio_input"

FORMAT = pyaudio.paFloat32
CHUNK = 2048
CHANNELS = 2
RATE = 44100

frames = []

def streamIn(CHUNK):
    print("Opening socket...")
    server = socket.socket( socket.AF_UNIX, socket.SOCK_STREAM )
    server.bind(sockfile)
    server.listen(5)
    conn, addr = server.accept()
    print 'accepted connection'

    while True:
        soundData, addr = conn.recvfrom(44+ (CHUNK * CHANNELS))
        frames.append(soundData)
        print(len(frames))

    conn.close()

def play(stream, CHUNK):
    BUFFER = 10
    while True:
        if len(frames) >= BUFFER:
            while True:
                print('.')
                stream.write(frames.pop(0), CHUNK)


if os.path.exists(sockfile):
    os.remove(sockfile)

print("Creating PyAudio stream...")

p = pyaudio.PyAudio()

stream = p.open(format=FORMAT,
                channels = CHANNELS,
                rate = RATE,
                output = True,
                frames_per_buffer = CHUNK,
                )

print "Listening..."

Ts = Thread(target = streamIn, args=(CHUNK,))
Tp = Thread(target = play, args=(stream, CHUNK,))
Ts.setDaemon(True)
Tp.setDaemon(True)
Ts.start()
Tp.start()
Ts.join()
Tp.join()

'''
print "-" * 20
print "Shutting down..."

server.close()
os.remove( sockfile )

print "Done"
'''
