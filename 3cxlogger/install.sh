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


        #Add repo
        echo "deb http://deb.debian.org/debian buster main" >> /etc/apt/sources.list

        #CHECK FOR DEPENDENCIES
        REQUIRED="software-properties-common python3 wget python3-pip";

        printf "\n\nInstalling $REQUIRED\n";
        sudo apt-get --yes install $REQUIRED;

        PIP="watchdog requests";
        printf "\n\nInstalling PIPs - $PIP\n";
        sudo pip3 install $PIP;

        printf "\n\nDownloading Program\n";

        #Download Python file
        wget https://cdn.jsdelivr.net/gh/PowerLabs-NZ/resources@release/3cxlogger/3cxlogger.service;
        wget https://cdn.jsdelivr.net/gh/PowerLabs-NZ/resources@release/3cxlogger/3cxlogger.py;

        #Create Config
        printf "\n\n-----------------------------------------------------------------------\n";
        echo "[3CX Logger]" >> "$PROGRAM_DIR\config.cfg"

        folderpath=NULL;

        while [ ! -d $folderpath ]
        do
            printf "Please enter the full path of the 3CX call log folder\n";
            read folderpath;

            if [ ! -d $folderpath ]; then
                printf "Folder not found\n\n";
            fi
        done

        echo "cdrfolder = $folderpath" >> "$PROGRAM_DIR\config.cfg"


        orgid=NULL;

        while [[ ! $orgid =~ ^\{?[A-F0-9a-f]{8}-[A-F0-9a-f]{4}-[A-F0-9a-f]{4}-[A-F0-9a-f]{4}-[A-F0-9a-f]{12}\}?$ ]]
        do
            printf "Please enter the org id\n";
            read orgid;

            if [[ ! $orgid =~ ^\{?[A-F0-9a-f]{8}-[A-F0-9a-f]{4}-[A-F0-9a-f]{4}-[A-F0-9a-f]{4}-[A-F0-9a-f]{12}\}?$ ]]; then
                printf "Org id not valid UUID\n\n";
            fi
        done

        echo "orgid = $orgid" >> "$PROGRAM_DIR\config.cfg"

        #Add column map to config file
        echo 'columnmap = {"historyid": 0,"callid": 1,"duration": 2,"timestart": 3,"timeanswered": 4,"timeend": 5,"reasonterminated": 6,"fromno": 7,"tono": 8,"fromdn": 9,"todn": 10,"dialno": 11,"reasonchanged": 12,"finalnumber": 13,"finaldn": 14,"billcode": 15,"billrate": 16,"billcost": 17,"billname": 18,"chain": 19,"fromtype": 20,"totype": 21,"finaltype": 22,"fromdispname": 23,"todispname": 24,"finaldispname": 25,"missedqueuecalls": 26,}' >> "$PROGRAM_DIR\config.cfg"

        #Add endpoint to config file
        echo 'endpoint = https://integration.powerlabs.co.nz/api/noauth/H8EDT3KA6TTU87PB66S3MPXV5Y5HUCVP/3cxcdr/' >> "$PROGRAM_DIR\config.cfg"

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