const { MacScanner } = require("mac-scanner");
const chalk = require("chalk");
const http = require("http");
const path = require("path");
const express = require("express");
require("polyfill-object.fromentries");
require("dotenv").config();

const targets = require("./targets.json");
const { formatTargets, formatMac, intro, getMyIP } = require("./utils");
const { messages } = require("./messages");
const { logger } = require("./logger");

const app = express();

app.use(
  "/logs",
  express.static(path.join(__dirname, "logs"), {
    index: false,
  })
);
const { cidr } = getMyIP()[0];

const config = {
  debug: false,
  initial: true,
  network: process.env.NETWORK || cidr,
  concurrency: 50,
  scanTimeout: 1500,
};

intro();
const scanner = new MacScanner(config);
const formattedTargets = formatTargets(targets);

http.createServer(app).listen(process.env.SERVER_PORT || 3030, function () {
  scanner.start();
  scanner.on("entered", ({ ip, mac }) => {
    const macName = formattedTargets[formatMac(mac)];
    console.log(
      macName
        ? chalk.greenBright(messages.connected)
        : chalk.red(messages.connected),
      chalk.yellowBright(macName || mac),
      `ip: ${ip}`
    );
    logger.info({
      level: "info",
      message: messages.connected,
      ip,
      mac,
      date: new Date(),
    });
    if (!macName) {
      logger.warn({
        level: "warn",
        message: messages.warnUnknown,
        ip,
        mac,
        date: new Date(),
      });
    }
  });

  scanner.on("changed", ({ mac, oldIP, newIP }) => {
    console.log(
      chalk.magenta(messages.changed),
      chalk.yellowBright(formattedTargets[formatMac(mac)] || mac),
      `from ${oldIP} to ${newIP}`
    );
  });

  scanner.on("left", ({ ip, mac }) => {
    console.log(
      chalk.green(messages.disconnected),
      chalk.yellowBright(formattedTargets[formatMac(mac)] || mac),
      `ip: ${ip}`
    );
  });
});
