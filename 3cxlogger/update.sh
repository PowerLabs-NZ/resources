#!/bin/bash

#GLOBAL VARIABLES

PROGRAM_DIR=/usr/bin/powerlabs_3cxlogger;

#BEGIN SCRIPT

cat << EOM
 ____                        _          _           _____  ______  __  _
|  _ \ _____      _____ _ __| |    __ _| |__  ___  |___ / / ___\ \/ / | |    ___   __ _  __ _  ___ _ __
| |_) / _ \ \ /\ / / _ \ |__| |   / _  | |_ \/ __|   |_ \| |    \  /  | |   / _ \ / _  |/ _  |/ _ \ |__|
|  __/ (_) \ V  V /  __/ |  | |__| (_| | |_) \__ \  ___) | |___ /  \  | |__| (_) | (_| | (_| |  __/ |
|_|   \___/ \_/\_/ \___|_|  |_____\__,_|_.__/|___/ |____/ \____/_/\_\ |_____\___/ \__, |\__, |\___|_|
                                                                                  |___/ |___/
EOM


#MOVE TO WORKSPACE
cd $PROGRAM_DIR;

sudo systemctl stop 3cxlogger.service;

printf "\n\nDownloading Program\n";

#Download Python file
wget -o 3cxlogger.service --no-cache https://cdn.jsdelivr.net/gh/PowerLabs-NZ/resources@release/3cxlogger/3cxlogger.service;
wget -o 3cxlogger.py --no-cache https://cdn.jsdelivr.net/gh/PowerLabs-NZ/resources@release/3cxlogger/3cxlogger.py;
wget -o updater.py --no-cache https://cdn.jsdelivr.net/gh/PowerLabs-NZ/resources@release/3cxlogger/updater.py;

sudo systemctl start 3cxlogger.service;

printf "\n\nInstaller Updater Cron\n";

croncmd="python3 $PROGRAM_DIR/updater.py";
cronjob="0 3 * * * $croncmd";
(crontab -l | grep -v -F "$croncmd" ; echo "$cronjob") | crontab -;