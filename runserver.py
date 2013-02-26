from gevent import monkey; monkey.patch_all()
from gevent.wsgi import WSGIServer
from backend import app
from werkzeug.serving import run_with_reloader
from werkzeug.debug import DebuggedApplication


@run_with_reloader
def run_server():
    app.debug = True

    http_server = WSGIServer(('', 81), DebuggedApplication(app))
    http_server.serve_forever()


if __name__ == "__main__":
    run_server()