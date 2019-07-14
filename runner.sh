sudo -S <<< "$1" sh -c "mv /tmp/hosts $2"
sudo -S <<< "$1" dscacheutil -flushcache
