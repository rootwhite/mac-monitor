/* eslint-disable no-restricted-globals */
const chalk = require("chalk");
const clear = require("clear");
const figlet = require("figlet");
const { networkInterfaces } = require("os");
const { messages } = require("./messages");

const logs = ["warn-unknown-mac.log", "mac-activity.log", "error.log"];

const nets = networkInterfaces();

const formatMac = (mac = "") =>
  mac
    .split(":")
    .map((item) => (!isNaN(item) ? Number(item) : item.toLowerCase()))
    .join(":");

const formatTargets = (targets) =>
  Object.fromEntries(
    Object.entries(targets).map(([key, value]) => [[formatMac(key)], value])
  );

const getMyIP = () => {
  const results = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === "IPv4" && !net.internal) {
        results.push({ address: net.address, cidr: net.cidr });
      }
    }
  }
  return results;
};

const intro = () => {
  clear();

  figlet(messages.title, (err, data) => {
    if (err) {
      console.log(messages.error);
      console.dir(err);
      return;
    }
    console.log(chalk.blueBright(messages.welcome));
    console.log(chalk.yellow(data), "\n");
    console.log(chalk.gray(`${messages.remotely}`));
    console.log(
      chalk.blueBright(
        logs
          .map(
            (log) =>
              `http://${getMyIP()[0].address || messages.unknown}:${
                process.env.SERVER_PORT
              }/logs/${log}`
          )
          .join("\n")
      ),
      "\n"
    );
  });
};

module.exports = {
  formatTargets,
  formatMac,
  intro,
  getMyIP,
  logs
};
