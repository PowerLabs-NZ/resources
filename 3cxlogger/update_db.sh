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

sudo -u postgres psql -d database_single -c "CREATE ROLE readaccess; GRANT CONNECT ON DATABASE database_single TO readaccess; GRANT USAGE ON SCHEMA public TO readaccess; GRANT SELECT ON ALL TABLES IN SCHEMA public TO readaccess; CREATE USER powerlabs WITH PASSWORD '$pass'; GRANT readaccess TO powerlabs"