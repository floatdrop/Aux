from gevent import monkey; monkey.patch_all()
from gevent.wsgi import WSGIServer
from backend import app
from werkzeug.serving import run_with_reloader
from werkzeug.debug import DebuggedApplication


def configure_logging(app):
    if app.debug:
        from logging import Formatter
        from logging.handlers import RotatingFileHandler
        file_handler = RotatingFileHandler("auxilium.log", maxBytes=1024 * 1024 * 4)
        file_handler.setFormatter(Formatter(
            '%(asctime)s %(levelname)s: %(message)s '
            '[in %(pathname)s:%(lineno)d]'
        ))
        app.logger.addHandler(file_handler)


@run_with_reloader
def run_server():
    app.debug = True

    configure_logging(app)

    http_server = WSGIServer(('', 81), DebuggedApplication(app, True))
    http_server.serve_forever()



if __name__ == "__main__":
    run_server()