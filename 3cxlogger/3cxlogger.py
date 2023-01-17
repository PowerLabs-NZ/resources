#!/usr/bin/env python
# -*- coding: utf-8 -*-

from hashlib import sha256
from importlib.resources import path
import sys, getopt, os
import time, csv, json
from types import SimpleNamespace
from watchdog.observers import Observer
from watchdog.events import PatternMatchingEventHandler
import configparser
import requests
import logging
import platform
import subprocess
from datetime import datetime
from datetime import timedelta

global pathtomonitor
global orgid
global mapping
global endpoint
global idhash
global dbpass
global dbimported
global dbconnected
global dbconnection
global queuemapping

try:
    import psycopg2
    dbimported = True
except ImportError:
    dbimported = False

global installdir

class cdr_row:
    def getQueueInformation(self, callhistoryid) -> tuple:
        cursor = dbconnection.cursor()
        cursor.execute("SELECT * FROM callcent_queuecalls WHERE call_history_id = '" + callhistoryid + "'")
        results = cursor.fetchone()
        logging.debug('Fetching queue wait time from database - ' + results)
        if results == None:
            return None
        else:
            return results

    def __init__(self, rowarray):
        isQueue = False
        queuearray: list

        try:
            toType = rowarray[mapping.totype]
            if ((toType == "Ivr" or toType == "LineSet") and dbconnected):
                logging.debug('Attempting to fetch queue')
                queue = self.getQueueInformation(rowarray[mapping.callid])
                if queue == None:
                    isQueue = False
                else:
                    logging.debug('Retrieved Queue')
                    isQueue = True
                    queuearray = queue
        except IndexError:
            isQueue = False

        try:
            self.historyid = rowarray[mapping.historyid]
        except IndexError:
            self.historyid = None

        try:
            self.callid = rowarray[mapping.callid]
        except IndexError:
            self.callid = None

        if isQueue:
            self.duration = queuearray[queuemapping.ts_servicing]
            logging.debug('Setting Duration to ' + queuearray[queuemapping.ts_servicing])
        else:
            try:
                self.duration = rowarray[mapping.duration]
            except IndexError:
                self.duration = None

        try:
            self.timestart = rowarray[mapping.timestart]
        except IndexError:
            self.timestart = None

        #########

        if isQueue:
            try:
                logging.debug('Apending to timeanswered')
                datetime_object = datetime.strptime(rowarray[mapping.timestart], '%Y-%m-%d %H:%M:%S')
                polling = queue[queuemapping.ts_polling]

                minutes = int(polling.split(':')[0])
                seconds = int(polling.split(':')[1].split('.')[0])
                self.timeanswered = datetime_object + timedelta(minutes=minutes, seconds=seconds)
                logging.debug('Added ' + polling + ' to ' + rowarray[mapping.timestart])
            except:
                try:
                    self.timeanswered = rowarray[mapping.timeanswered]
                except IndexError:
                    self.timeanswered = None
        else:
            try:
                self.timeanswered = rowarray[mapping.timeanswered]
            except IndexError:
                self.timeanswered = None


        #########

        try:
            self.timeend = rowarray[mapping.timeend]
        except IndexError:
            self.timeend = None

        try:
            self.reasonterminated = rowarray[mapping.reasonterminated]
        except IndexError:
            self.reasonterminated = None

        try:
            self.fromno = rowarray[mapping.fromno]
        except IndexError:
            self.fromno = None

        try:
            self.tono = rowarray[mapping.tono]
        except IndexError:
            self.tono = None

        try:
            self.fromdn = rowarray[mapping.fromdn]
        except IndexError:
            self.fromdn = None

        try:
            self.todn = rowarray[mapping.todn]
        except IndexError:
            self.todn = None

        try:
            self.dialno = rowarray[mapping.dialno]
        except IndexError:
            self.dialno = None

        try:
            self.reasonchanged = rowarray[mapping.reasonchanged]
        except IndexError:
            self.reasonchanged = None

        try:
            self.finalnumber = rowarray[mapping.finalnumber]
        except IndexError:
            self.finalnumber = None

        try:
            self.finaldn = rowarray[mapping.finaldn]
        except IndexError:
            self.finaldn = None

        try:
            self.billcode = rowarray[mapping.billcode]
        except IndexError:
            self.billcode = None

        try:
            self.billrate = rowarray[mapping.billrate]
        except IndexError:
            self.billrate = None

        try:
            self.billcost = rowarray[mapping.billcost]
        except IndexError:
            self.billcost = None

        try:
            self.billname = rowarray[mapping.billname]
        except IndexError:
            self.billname = None

        try:
            self.chain = rowarray[mapping.chain]
        except IndexError:
            self.chain = None

        try:
            self.fromtype = rowarray[mapping.fromtype]
        except IndexError:
            self.fromtype = None

        try:
            self.totype = rowarray[mapping.totype]
        except IndexError:
            self.totype = None

        try:
            self.finaltype = rowarray[mapping.finaltype]
        except IndexError:
            self.finaltype = None

        try:
            self.fromdispname = rowarray[mapping.fromdispname]
        except IndexError:
            self.fromdispname = None

        try:
            self.todispname = rowarray[mapping.todispname]
        except IndexError:
            self.todispname = None

        try:
            self.finaldispname = rowarray[mapping.finaldispname]
        except IndexError:
            self.finaldispname = None

        try:
            self.missedqueuecalls = rowarray[mapping.missedqueuecalls]
        except IndexError:
            self.missedqueuecalls = None

def getmachineid():
    machineid = None
    ostype = platform.system()
    if (ostype == "Windows"):
        process = subprocess.Popen('wmic csproduct get UUID', shell=True, stdout=subprocess.PIPE)
        process.wait()
        output = process.stdout.read().decode('utf-8').replace('\r','').strip()
        machineid = output.split('\n')[1].strip()
    elif (ostype == "Linux"):
        process = subprocess.Popen('cat /etc/machine-id', shell=True, stdout=subprocess.PIPE)
        process.wait()
        machineid = process.stdout.read().decode('utf-8').strip()
    return machineid

def process_csv(filepath, isFileDir = False):
    headers = {'x-3cxlogger-uploadkey': idhash, 'x-3cxlogger-orgid': orgid}
    try:
        Ready = False
        while Ready == False:
            response = requests.get(endpoint+"status", headers=headers)
            if (response.status_code == 429):
                time.sleep(60)
            elif (response.status_code == 200):
                Ready = True
            elif (response.status_code == 401):
                print("Server unauthroised - Waiting for admin approval")
                logging.error("Server unauthroised - Waiting for admin approval")
                time.sleep(60)
            elif (response.status_code == 403):
                logging.error("Server is not allowed to upload logs")
                print("Server is not allowed to upload logs")
                sys.exit(2)
            else:
                logging.error("Failed to get status with status code" + str(response.status_code))
        logging.debug('Attempting to parse ' + filepath)
        lines = []
        response_pass = True
        with open(filepath, 'r') as file:
            reader = csv.reader(file)
            for row in reader:
                if (len(row) > 0):
                    formatedrow = cdr_row(row)
                    lines.append(formatedrow)
                    logging.debug('Adding line to array: ' + json.dumps(formatedrow.__dict__))
        file.close()
        for line in lines:
            logging.debug('Sending lines to integration server')
            uploaded = False
            while uploaded == False:
                response = requests.post(endpoint+orgid, json.dumps(line.__dict__), headers=headers)
                if (response.status_code == 429):
                    logging.debug(str(response.status_code) + " - Waiting for throttle")
                    time.sleep(60)
                elif (response.status_code == 201 or response.status_code == 409):
                    uploaded = True
                    if (response.status_code == 201):
                        logging.debug(str(response.status_code) + " - Uploaded")
                    elif (response.status_code == 409):
                        logging.debug(str(response.status_code) + " - Duplicate")
                elif (response.status_code == 401):
                    logging.error("Server unauthroised - Waiting for admin approval")
                    time.sleep(60)
                elif (response.status_code == 403):
                    logging.error("Server is not allowed to upload logs")
                    sys.exit(2)
                elif (response.status_code != 201 and response.status_code != 409):
                    logging.debug('Failed to uploaded line with status code ' + str(response.status_code))
                    response_pass = False

        if response_pass:
            logging.debug('Attempting to delete file')
            for attempt in range(10):
                try:
                    logging.debug("Deleting " + filepath)
                    os.remove(filepath)
                except Exception as e:
                    print("Cannot Delete file")
                    print(str(e))
                    logging.error('Unable to delete file ' + str(e))
                    print('Unable to delete file ' + str(e))
                    time.sleep(1)
                else:
                    break
    except Exception as e:
        print("Error parsing CSV")
        print(str(e))
        logging.error('Unable to parse file ' + str(e))
        print('Unable to parse file ' + str(e))
        if str(e) == 'line contains NUL':
            print("Replacing null values in file and rewriting out")
            logging.error("Replacing null values in file and rewriting out")
            print("Replacing null values in file and rewriting out")
            fin = open(filepath, "rt")
            data = fin.read()
            data = data.replace('\x00', '')
            fin.close()
            fin = open(filepath, "wt")
            fin.write(data)
            fin.close()


def on_created(event):
    time.sleep(5)
    process_csv(event.src_path) 

def parseexisting():
    for filename in os.listdir(pathtomonitor):
        f = os.path.join(pathtomonitor, filename)
        if os.path.isfile(f):
            process_csv(f, True)

try:
    installdir = "/usr/bin/powerlabs_3cxlogger/"
    logging.basicConfig(filename=installdir + '/debug.log', level=logging.ERROR)
    parser = configparser.RawConfigParser()
    parser.read(installdir + '/config.cfg')
    pathtomonitor = parser.get('3CX Logger', 'cdrfolder')
    orgid = parser.get('3CX Logger', 'orgid')
    mapping = json.loads(parser.get('3CX Logger', 'columnmap', fallback='{"historyid": 0,"callid": 1,"duration": 2,"timestart": 3,"timeanswered": 4,"timeend": 5,"reasonterminated": 6,"fromno": 7,"tono": 8,"fromdn": 9,"todn": 10,"dialno": 11,"reasonchanged": 12,"finalnumber": 13,"finaldn": 14,"billcode": 15,"billrate": 16,"billcost": 17,"billname": 18,"chain": 19,"fromtype": 20,"totype": 21,"finaltype": 22,"fromdispname": 23,"todispname": 24,"finaldispname": 25,"missedqueuecalls": 26}'), object_hook=lambda d: SimpleNamespace(**d))
    endpoint = parser.get('3CX Logger', 'endpoint')
    idhash = parser.get('3CX Logger', 'hashid', fallback="ERROR")
    dbpass = parser.get('3CX Logger', 'db_pass', fallback="ERROR")

    queuemapping = json.loads(parser.get('3CX Logger', 'queuehistorymap', fallback='{"idcallcent_queuecalls": 0,"q_num": 1,"time_start": 2,"time_end": 3,"ts_waiting": 4,"ts_polling": 5,"ts_servicing": 6,"ts_locating": 7,"count_polls": 8,"count_dialed": 9,"count_rejected": 10,"count_dials_timed": 11,"reason_noanswercode": 12,"reason_failcode": 13,"reason_noanswerdesc": 14,"reason_faildesc": 15,"call_history_id": 16,"q_cal": 17,"from_userpart": 18,"from_displayname": 19,"to_dialednum": 20,"to_dn": 21,"to_dntype": 22,"cb_num": 23,"call_result": 24,"deal_status": 25,"is_visible": 26,"is_agent": 27 }'), object_hook=lambda d: SimpleNamespace(**d))

    if (idhash == "ERROR"):
        idhash = sha256((orgid + getmachineid()).encode()).hexdigest()
        parser.set('3CX Logger', 'hashid', idhash)
        with open(installdir + '/config.cfg', 'w') as configfile:
            parser.write(configfile)

    if (dbimported and dbpass != "ERROR"):
        try:
            dbconnection = psycopg2.connect(host='localhost', database='database_single',user='powerlabs', password=dbpass)
            dbconnected = True
        except psycopg2.DatabaseError as e:
            dbconnected = False
    else:
        dbconnected = False

except Exception as e:
    print('Failed to load config file')
    print(e)
    sys.exit(2)

parseexisting()

patterns = ["*"]
ignore_patterns = None
ignore_directories = False
case_sensitive = True
my_event_handler = PatternMatchingEventHandler(patterns, ignore_patterns, ignore_directories, case_sensitive)
my_event_handler.on_created = on_created
go_recursively = True
my_observer = Observer()
my_observer.schedule(my_event_handler, pathtomonitor, recursive=go_recursively)

my_observer.start()

try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    my_observer.stop()
    my_observer.join()
