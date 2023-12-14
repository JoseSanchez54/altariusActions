#!/bin/bash
gnome-keyring-daemon --daemonize --login
cd
cd Documentos/GitHub/altariusActions/
git pull
npm install
npm run all
shutdown -h +3