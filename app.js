const express = require('express');
const {createServer} = require('http');
const {createEndpoint} = require('@jambonz/node-client-ws');
const app = express();
const server = createServer(app);
const makeService = createEndpoint({server});
const opts = Object.assign({
  timestamp: () => `, "time": "${new Date().toISOString()}"`,
  level: process.env.LOGLEVEL || 'info'
});
const logger = require('pino')(opts);
const port = process.env.HTTP_PORT || 3000;

// Set up app locals
app.locals = {
  ...app.locals,
  logger,
  makeService
};

// Add middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set up WebSocket route directly
require('./lib/routes/retell')({logger, makeService});

server.listen(port, () => {
  logger.info(`jambonz websocket server listening at http://localhost:${port}`);
});
