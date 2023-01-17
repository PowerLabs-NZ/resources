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
        echo "deb http://security.debian.org/debian-security buster/updates main " >> /etc/apt/sources.list

        sudo apt-get update

        #CHECK FOR DEPENDENCIES
        REQUIRED="software-properties-common python3 curl python3-pip libpq-dev";

        printf "\n\nInstalling $REQUIRED\n";
        sudo apt-get --yes install $REQUIRED;

        PIP="watchdog requests psycopg2";
        printf "\n\nInstalling PIPs - $PIP\n";
        sudo pip3 install $PIP;

        printf "\n\nDownloading Program\n";

        #Download Python file
        curl -o 3cxlogger.service -H 'Cache-Control: no-cache, no-store' https://cdn.jsdelivr.net/gh/PowerLabs-NZ/resources@release/3cxlogger/3cxlogger.service;
        curl -o 3cxlogger.py -H 'Cache-Control: no-cache, no-store' https://cdn.jsdelivr.net/gh/PowerLabs-NZ/resources@release/3cxlogger/3cxlogger.py;
        curl -o updater.py -H 'Cache-Control: no-cache, no-store' https://cdn.jsdelivr.net/gh/PowerLabs-NZ/resources@release/3cxlogger/updater.py;

        #Create Config
        printf "\n\n-----------------------------------------------------------------------\n";
        touch $PROGRAM_DIR/config.cfg

        echo "[3CX Logger]" >> "$PROGRAM_DIR/config.cfg"

        folderpath=NULL;

        while [ ! -d $folderpath ]
        do
            printf "Please enter the full path of the 3CX call log folder\n";
            read folderpath;

            if [ ! -d $folderpath ]; then
                printf "Folder not found\n\n";
            fi
        done

        echo "cdrfolder = $folderpath" >> "$PROGRAM_DIR/config.cfg"


        orgid=NULL;

        while [[ ! $orgid =~ ^\{?[A-F0-9a-f]{8}-[A-F0-9a-f]{4}-[A-F0-9a-f]{4}-[A-F0-9a-f]{4}-[A-F0-9a-f]{12}\}?$ ]]
        do
            printf "Please enter the org id\n";
            read orgid;

            if [[ ! $orgid =~ ^\{?[A-F0-9a-f]{8}-[A-F0-9a-f]{4}-[A-F0-9a-f]{4}-[A-F0-9a-f]{4}-[A-F0-9a-f]{12}\}?$ ]]; then
                printf "Org id not valid UUID\n\n";
            fi
        done

        echo "orgid = $orgid" >> "$PROGRAM_DIR/config.cfg"

        #Add column map to config file
        echo 'columnmap = {"historyid": 0,"callid": 1,"duration": 2,"timestart": 3,"timeanswered": 4,"timeend": 5,"reasonterminated": 6,"fromno": 7,"tono": 8,"fromdn": 9,"todn": 10,"dialno": 11,"reasonchanged": 12,"finalnumber": 13,"finaldn": 14,"billcode": 15,"billrate": 16,"billcost": 17,"billname": 18,"chain": 19,"fromtype": 20,"totype": 21,"finaltype": 22,"fromdispname": 23,"todispname": 24,"finaldispname": 25,"missedqueuecalls": 26}' >> "$PROGRAM_DIR/config.cfg"
        echo 'queuehistorymap = {"idcallcent_queuecalls": 0,"q_num": 1,"time_start": 2,"time_end": 3,"ts_waiting": 4,"ts_polling": 5,"ts_servicing": 6,"ts_locating": 7,"count_polls": 8,"count_dialed": 9,"count_rejected": 10,"count_dials_timed": 11,"reason_noanswercode": 12,"reason_failcode": 13,"reason_noanswerdesc": 14,"reason_faildesc": 15,"call_history_id": 16,"q_cal": 17,"from_userpart": 18,"from_displayname": 19,"to_dialednum": 20,"to_dn": 21,"to_dntype": 22,"cb_num": 23,"call_result": 24,"deal_status": 25,"is_visible": 26,"is_agent": 27 }'  >> "$PROGRAM_DIR/config.cfg"

        #Add endpoint to config file
        echo 'endpoint = https://integration.powerlabs.co.nz/api/noauth/H8EDT3KA6TTU87PB66S3MPXV5Y5HUCVP/3cxcdr/' >> "$PROGRAM_DIR/config.cfg"

        #Add DB Pass to config file
        pass=$(tr -dc A-Za-z0-9 </dev/urandom | head -c 64);
        echo "dbpass = $pass" >> "$PROGRAM_DIR/config.cfg"

        printf "\n\nInstalling service\n";

        sudo cp 3cxlogger.service /etc/systemd/system/3cxlogger.service;

        printf "\n\nReload daemon\n";

        sudo systemctl daemon-reload;

        printf "\n\nEnable start on boot\n";

        sudo systemctl enable 3cxlogger.service;

        printf "\n\nGranting Database Permissions"

        sudo -u postgres psql -d database_single -c "CREATE ROLE readaccess; GRANT CONNECT ON DATABASE database_single TO readaccess; GRANT USAGE ON SCHEMA public TO readaccess; GRANT SELECT ON ALL TABLES IN SCHEMA public TO readaccess; CREATE USER powerlabs WITH PASSWORD '$pass'; GRANT readaccess TO powerlabs"

        printf "\n\nStart service\n";

        sudo systemctl start 3cxlogger.service;

        printf "\n\nInstaller Updater Cron\n";

        croncmd="python3 $PROGRAM_DIR/updater.py";
        cronjob="0 3 * * * $croncmd";
        (crontab -l | grep -v -F "$croncmd" ; echo "$cronjob") | crontab -;
        

else
    printf "\nPowerLabs 3CX Logger is already installed. Remove $PROGRAM_DIR to reinstall\n\n";
fi