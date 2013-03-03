from engine import world

from flask import Flask
app = Flask(__name__)
world.logger = app.logger

import backend.views
