#!/usr/bin/env python
# -*- coding: utf-8 -*-

import hashlib
import logging
import shutil
import sys
import subprocess
import requests
import os

try:
    logging.basicConfig(filename='/usr/bin/powerlabs_3cxlogger/updater.log', level=logging.NOTSET)

    try:
        response = requests.get("https://cdn.jsdelivr.net/gh/PowerLabs-NZ/resources@release/3cxlogger/3cxlogger.py")
        open("/usr/bin/powerlabs_3cxlogger/temp.py", "wb").write(response.content)
    except Exception as e:
        print('Failed to download new file')
        print(e)
        logging.error('Failed to download new file ' + str(e))
        sys.exit(2)

    try:
        subprocess.run("service 3cxlogger stop", shell=True)
    except Exception as e:
        print('Failed to stop process')
        print(e)
        logging.error('Failed to stop process ' + str(e))
        sys.exit(2)

    try:
        with open('/usr/bin/powerlabs_3cxlogger/3cxlogger.py', 'rb') as file_to_check:
            data = file_to_check.read()
            pythonFile = hashlib.md5(data).hexdigest()

        with open('/usr/bin/powerlabs_3cxlogger/temp.py', 'rb') as file_to_check:
            data = file_to_check.read()
            tempPythonFile = hashlib.md5(data).hexdigest()
    except Exception as e:
        print('Failed to get hashes')
        print(e)
        logging.error('Failed to get hashes ' + str(e))
        sys.exit(2)

    try:
        if (tempPythonFile != pythonFile):
            shutil.move("/usr/bin/powerlabs_3cxlogger/temp.py", "/usr/bin/powerlabs_3cxlogger/3cxlogger.py")
    except Exception as e:
        print('Failed to copy new file')
        print(e)
        logging.error('Failed to copy new file ' + str(e))
        sys.exit(2)

    try:
        os.remove('/usr/bin/powerlabs_3cxlogger/debug.log')
    except Exception as e:
        print('Failed to start process')
        print(e)
        logging.error('Failed to start process ' + str(e))
        sys.exit(2)

    try:
        subprocess.run("service 3cxlogger start", shell=True)
        os.remove('/usr/bin/powerlabs_3cxlogger/updater.log')
    except Exception as e:
        print('Failed to start process')
        print(e)
        logging.error('Failed to start process ' + str(e))
        sys.exit(2)

    

except Exception as e:
    print('Failed to update file')
    print(e)
    logging.error('Failed to update file ' + str(e))
    sys.exit(2)