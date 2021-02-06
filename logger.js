const winston = require("winston");
const path = require("path");
const { logs } = require("./utils");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "mac-scanner" },
  transports: [
    new winston.transports.File({
      filename: path.join(__dirname, "logs", logs[0]),
      level: "warn",
    }),
    new winston.transports.File({
      filename: path.join(__dirname, "logs", logs[1]),
      level: "info",
    }),
    new winston.transports.File({
      filename: path.join(__dirname, "logs", logs[2]),
      level: "error",
    }),
  ],
});

module.exports = {
  logger,
};
