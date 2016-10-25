

import socket
import os

sockfile = "/tmp/abi_audio_input"

if os.path.exists(sockfile):
    os.remove(sockfile)

print("Opening socket...")

server = socket.socket( socket.AF_UNIX, socket.SOCK_STREAM )
server.bind(sockfile)
server.listen(5)

print "Listening..."
while True:
  conn, addr = server.accept()

  print 'accepted connection'

  while True:

    data = conn.recv( 1024 )
    if not data:
        break
    else:
        print "-" * 20
        print data
        if "DONE" == data:
            break
print "-" * 20
print "Shutting down..."

server.close()
os.remove( sockfile )

print "Done"
