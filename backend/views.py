from backend import app

@app.route('/')
def hello_world():
    raise Exception("Lol no")
    return 'Hello World!'