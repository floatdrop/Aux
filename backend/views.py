from backend import app

@app.route('/')
def hello_world():
    app.logger.info("Hello Logger!")
    return 'Hello World!'