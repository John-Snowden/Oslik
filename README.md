<!-- start 2 virtual ports -->
socat -d -d pty,raw,echo=0 pty,raw,echo=0

<!-- ? -->
sudo adduser john-snowden dialout
sudo chown john-snowden /dev/pts
sudo chmod o+rw /dev/pts

<!-- router setup -->
назначь оранджпаю статичский ip

<!-- OrangePI  -->
https://192.168.1.9/

сеть TP-LINK_98B814 GKvattech
У Германа ssh root@192.168.0.100
orangepi

ssh root@192.168.1.112
password orangepi
<!-- scp -r ~/Desktop/Oslik1.1/Oslik  root@192.168.1.112:/home/orangepi/Desktop -->
scp -r ~/Desktop/Oslik1.1/Oslik  root@192.168.1.112:/
cd /home/orangepi/Desktop/Oslik
<!-- nodejs -->
sudo apt update
sudo apt install nodejs   
sudo apt install npm
sudo npm cache clean -f
sudo npm install -g n
sudo n stable
sudo n 18.18.2
close terminal for changes to take effect
<!--  -->
npm i -g ts-node
rm -r node_modules && npm i
<!-- pm2 run index.ts at startup -->
npm i -g pm2
pm2 start index.ts --interpreter /usr/local/bin/ts-node
pm2 startup
pm2 save
reboot
pm2 log
pm2 unstartup systemd
pm2 delete all
pm2 cleardump

<!-- Arduino link -->
ls /dev/serial/by-id/

<!-- task -->
  {
    "distance": 0.1,
    "degree": 45,
    "speed": 3,
    "timeout": 0
  }

<!-- mount usb-->
shell.exec('mount /dev/sda1 ./media')

<!-- mount android -->
sudo apt-get install android-file-transfer
aft-mtp-mount /Oslik/media/

<!-- unmount android -->
fusermount -u /Oslik/media/