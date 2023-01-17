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

echo "deb http://security.debian.org/debian-security buster/updates main " >> /etc/apt/sources.list

sudo apt-get update;

REQUIRED="libpq-dev";

printf "\n\nInstalling $REQUIRED\n";
sudo apt-get --yes install $REQUIRED;

PIP="psycopg2";
printf "\n\nInstalling PIPs - $PIP\n";
sudo pip3 install $PIP;

printf "\n\nCreating Password\n";

pass=$(tr -dc A-Za-z0-9 </dev/urandom | head -c 64);

printf "Pass:$pass"

printf "\n\nStoring Pass in Config\n"

echo "dbpass = $pass" >> "$PROGRAM_DIR/config.cfg"

echo 'queuehistorymap = {"idcallcent_queuecalls": 0,"q_num": 1,"time_start": 2,"time_end": 3,"ts_waiting": 4,"ts_polling": 5,"ts_servicing": 6,"ts_locating": 7,"count_polls": 8,"count_dialed": 9,"count_rejected": 10,"count_dials_timed": 11,"reason_noanswercode": 12,"reason_failcode": 13,"reason_noanswerdesc": 14,"reason_faildesc": 15,"call_history_id": 16,"q_cal": 17,"from_userpart": 18,"from_displayname": 19,"to_dialednum": 20,"to_dn": 21,"to_dntype": 22,"cb_num": 23,"call_result": 24,"deal_status": 25,"is_visible": 26,"is_agent": 27 }'  >> "$PROGRAM_DIR/config.cfg"

sudo -u postgres psql -d database_single -c "CREATE ROLE readaccess; GRANT CONNECT ON DATABASE database_single TO readaccess; GRANT USAGE ON SCHEMA public TO readaccess; GRANT SELECT ON ALL TABLES IN SCHEMA public TO readaccess; CREATE USER powerlabs WITH PASSWORD '$pass'; GRANT readaccess TO powerlabs;"