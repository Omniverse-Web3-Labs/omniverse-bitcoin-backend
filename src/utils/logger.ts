import log4js from "log4js";

let configure = {
  appenders: {
    fileout: { type: 'file', filename: 'logs/main.log' },
    consoleout: { type: 'stdout' },
  },
  categories: {
    default: { appenders: ['consoleout'], level: 'off' },
    main: { appenders: ['fileout', 'consoleout'], level: 'all' },
  },
};

log4js.configure(configure);

export default log4js;