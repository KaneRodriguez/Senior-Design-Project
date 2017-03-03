#!/bin/sh
# launcher.sh

cd /
sudo service dnsmasq stop
sudo service hostapd stop
sudo ifdown wlan0
sudo service dnsmasq start
sudo service hostapd start
sudo service apache2 start
sudo ifup wlan0
node /home/pi/Documents/MTAV_Senior-Design-Project/node-server/server.js
