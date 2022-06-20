#!/usr/bin/env python
# -*- coding: utf-8 -*-

from importlib.resources import path
import sys, getopt, os
import time, csv, json
from types import SimpleNamespace
from watchdog.observers import Observer
from watchdog.events import PatternMatchingEventHandler
import configparser
import requests
import logging

global pathtomonitor
global orgid
global mapping
global endpoint

class cdr_row:
    def __init__(self, rowarray):
        try:
            self.historyid = rowarray[mapping.historyid]
        except IndexError:
            self.historyid = None

        try:
            self.callid = rowarray[mapping.callid]
        except IndexError:
            self.callid = None

        try:
            self.duration = rowarray[mapping.duration]
        except IndexError:
            self.duration = None

        try:
            self.timestart = rowarray[mapping.timestart]
        except IndexError:
            self.timestart = None

        try:
            self.timeanswered = rowarray[mapping.timeanswered]
        except IndexError:
            self.timeanswered = None

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

def process_csv(filepath, isFileDir = False):
    try:
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
            response = requests.post(endpoint+orgid, json.dumps(line.__dict__), verify=False)
            if (response.status_code != 201 and response.status_code != 409):
                logging.debug('Successfull uploaded line with status code ' + str(response.status_code))
                response_pass = False
        if response_pass:
            logging.debug('Attempting to delete file')
            for attempt in range(10):
                try:
                    print("Deleting " + filepath)
                    os.remove(filepath)
                except Exception as e:
                    print("Cannot Delete file")
                    print(str(e))
                    logging.error('Unable to delete file ' + str(e))
                    time.sleep(1)
                else:
                    break
        if isFileDir:
            parseexisting()
    except Exception as e:
        print("Error parsing CSV")
        print(str(e))
        logging.error('Unable to parse file ' + str(e))

def on_created(event):
    time.sleep(5)
    process_csv(event.src_path) 

def parseexisting():
    for filename in os.listdir(pathtomonitor):
        f = os.path.join(pathtomonitor, filename)
        if os.path.isfile(f):
            process_csv(f, True)

try:
    logging.basicConfig(filename='/usr/bin/powerlabs_3cxlogger/debug.log', level=logging.DEBUG)
    parser = configparser.RawConfigParser()
    parser.read('/usr/bin/powerlabs_3cxlogger/config.cfg')
    pathtomonitor = parser.get('3CX Logger', 'cdrfolder')
    orgid = parser.get('3CX Logger', 'orgid')
    mapping = json.loads(parser.get('3CX Logger', 'columnmap'), object_hook=lambda d: SimpleNamespace(**d))
    endpoint = parser.get('3CX Logger', 'endpoint')
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
