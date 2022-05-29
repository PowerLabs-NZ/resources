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

#CHECK FOR PROGRAM DIR
if [ ! -d "$PROGRAM_DIR" ]; then
        sudo mkdir $PROGRAM_DIR;

        #MOVE TO WORKSPACE
        cd $PROGRAM_DIR;

        #CHECK FOR DEPENDENCIES
        REQUIRED="inotify-tools software-properties-common python3 wget pip3";

        printf "\n\nInstalling $REQUIRED\n";
        sudo apt-get --yes install $REQUIRED;

        PIP="watchdog";
        printf "\n\nInstalling PIPs - $PIP\n";
        sudo pip3 install $PIP;

        printf "\n\nDownloading Program\n";

        #Download Python file
        wget https://cdn.jsdelivr.net/gh/PowerLabs-NZ/resources@release/3cxlogger/3cxlogger.service;
        wget https://cdn.jsdelivr.net/gh/PowerLabs-NZ/resources@release/3cxlogger/3cxlogger.py;

        printf "\n\nInstalling service\n";

        sudo cp 3cxlogger.service /etc/systemd/system/3cxlogger.service;

        printf "\n\nReload daemon\n";

        sudo systemctl daemon-reload;

        printf "\n\nEnable start on boot\n";

        sudo systemctl enable 3cxlogger.service;

        printf "\n\nStart service\n";

        sudo systemctl start 3cxlogger.service;

else
        printf "\nPowerLabs 3CX Logger is already installed. Remove $PROGRAM_DIR to reinstall\n\n";
fi
