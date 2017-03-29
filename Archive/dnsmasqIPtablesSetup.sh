sudo iptables -F
sudo iptables -i wlan0 -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
sudo iptables -i wlan0 -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -i wlan0 -A INPUT -p udp --dport 53 -j ACCEPT
sudo iptables -i wlan0 -A INPUT -p udp --dport 67:68 -j ACCEPT
sudo iptables -i wlan0 -A INPUT -j DROP

sudo sh -c "iptables-save > /etc/iptables.rules"
