const pino = require('pino');
const log = pino({
    prettyPrint: {
        colorize: true,
        //   levelFirst: true
    },
    prettifier: require('pino-pretty'),
});

module.exports = log;
