from gevent import Greenlet, sleep
import logging
from datetime import datetime

FPS = 1

class World(Greenlet):
    def __init__(self):
        Greenlet.__init__(self)
        self.logger = logging.getLogger(self.__class__.__name__)

    def _run(self):
        self.running = True
        i = 0

        lastStep = datetime.now()
        while self.running:
            sleep(1.0 / FPS)
            now = datetime.now()
            stepTime = float((now - lastStep).microseconds) / 10 ** 6
            self.logger.info("Difference: %s" % (now-lastStep))
            lastStep = now

    def shutdown(self):
        self.logger.info("World is going down!")
        self.running = False