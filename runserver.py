from gevent.wsgi import WSGIServer
from backend import app

http_server = WSGIServer(('', 81), app)
http_server.serve_forever()