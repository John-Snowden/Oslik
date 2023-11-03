<!-- start 2 virtual ports -->
socat -d -d pty,raw,echo=0 pty,raw,echo=0

<!-- ? -->
sudo adduser john-snowden dialout
sudo chown john-snowden /dev/pts
sudo chmod o+rw /dev/pts

<!-- router setup -->
назначь оранджпаю статичский ip

<!-- pm2 run index.ts at startup -->
which ts-node
pm2 start index.ts --interpreter /usr/local/bin/ts-node
pm2 log
pm2 startup
sudo env PATH=$PATH:/usr/local/bin /usr/local/lib/node_modules/pm2/bin/pm2 startup systemd -u john-snowden --hp /home/john-snowden
pm2 save

[PM2] Init System found: systemd
Platform systemd
Template
[Unit]
Description=PM2 process manager
Documentation=https://pm2.keymetrics.io/
After=network.target

[Service]
Type=forking
User=john-snowden
LimitNOFILE=infinity
LimitNPROC=infinity
LimitCORE=infinity
Environment=PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin:/usr/local/bin:/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin
Environment=PM2_HOME=/home/john-snowden/.pm2
PIDFile=/home/john-snowden/.pm2/pm2.pid
Restart=on-failure

ExecStart=/usr/local/lib/node_modules/pm2/bin/pm2 resurrect
ExecReload=/usr/local/lib/node_modules/pm2/bin/pm2 reload all
ExecStop=/usr/local/lib/node_modules/pm2/bin/pm2 kill

[Install]
WantedBy=multi-user.target

Target path
/etc/systemd/system/pm2-john-snowden.service
Command list
[ 'systemctl enable pm2-john-snowden' ]
[PM2] Writing init configuration in /etc/systemd/system/pm2-john-snowden.service
[PM2] Making script booting at startup...
[PM2] [-] Executing: systemctl enable pm2-john-snowden...
Created symlink /etc/systemd/system/multi-user.target.wants/pm2-john-snowden.service → /etc/systemd/system/pm2-john-snowden.service.
[PM2] [v] Command successfully executed.
+---------------------------------------+
[PM2] Freeze a process list on reboot via:
$ pm2 save
[PM2] Saving current process list...
[PM2] Successfully saved in /home/john-snowden/.pm2/dump.pm2

[PM2] Remove init script via:
$ pm2 unstartup systemd

<!-- TTrack -->
дистанция в см
направление в градусах
скорость в м/с
таймаут в мс

<!-- OrangePI  -->
ssh root@192.168.1.9
password orangepi
cd /home/orangepi/Desktop
scp -r ~/Desktop/Oslik1.1/Oslik/  root@192.168.1.98:/home/orangepi/Desktop
npm i -g ts-node
rm -r node_modules
npm i
npm i -g pm2
pm2 start index.ts --interpreter /usr/local/bin/ts-node
pm2 log
pm2 startup
pm2 save
reboot