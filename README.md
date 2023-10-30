socat -d -d pty,raw,echo=0 pty,raw,echo=0

sudo adduser john-snowden dialout
sudo chown john-snowden /dev/pts
sudo chmod o+rw /dev/pts