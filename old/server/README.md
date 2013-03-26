Server
======

This game tested on nodejs v0.8.0 with following libraries:

- underscore
- log
- socket.io
- node-static
- async

All of them can be installed via `npm install -d` (this will install a local copy of all the dependencies in the node_modules directory)

Configuration
-------------

The server settings can be configured.
Copy `config_local.json-dist` to a new `config_local.json` file, then edit it. The server will override default settings with this file.

Deployment
----------

In order to deploy the server, simply copy the `server` and `shared` directories to the staging/production server.

Then run `node server/js/main.js` in order to start the server.

Note: the `shared` directory is the only one in the project which is a server dependency.