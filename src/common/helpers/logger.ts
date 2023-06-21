/**
 * This helper ensures consistent system logging
 * It includes formatting the log message when displayed on the command line
 */

import winston from 'winston';
import { toUpper } from 'lodash';
import { inspect } from 'util';
import chalk from 'chalk';
import ecsFormat from '@elastic/ecs-winston-format';

import env, { Environment } from '../../../config/env';
import { version } from '../../../package.json';

export enum LogLevel {
  Debug = 'debug',
  Warning = 'warn',
  Info = 'info',
  Error = 'error',
}

const defaultMeta = {};

const commonFormats = [
  winston.format.errors({ stack: true }),
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss',
  }),
];

function getLevel() {
  switch (env.environment) {
    case 'production':
      return 'info';
    case 'test':
      return 'error';
    default:
      return 'debug';
  }
}

function timeToColor(time: number) {
  if (time > 1000) return 'red';
  if (time > 150) return 'yellow';
  return 'green';
}

function getStyle(level: LogLevel) {
  switch (level) {
    case LogLevel.Error:
      return [chalk.red.bold, chalk.red.bold];
    case LogLevel.Warning:
      return [chalk.yellow.bold, chalk.yellow.bold];
    case LogLevel.Info:
      return [chalk.blueBright.bold, chalk.blueBright];
    default:
      return [chalk.whiteBright.bold, chalk.whiteBright];
  }
}

function printer(info: winston.Logform.TransformableInfo) {
  const label = info.component || info.level;
  const [labelStyle, messageStyle] = getStyle(label);
  let msg = info.message;

  if (msg?.toString === Object.prototype.toString) {
    msg = inspect(info.message, { depth: 3 });
  }

  const output = [info.timestamp, `<${version}>`, labelStyle(`[${toUpper(label)}]`), messageStyle(info.message)];

  if (info.execTime) {
    output.push(chalk[timeToColor(info.execTime)](`[${info.execTime} ms]`));
  }

  return output.join(' ');
}

const createLoggerForEnv = (environment: string | Environment) => {
  switch (environment) {
    case Environment.Production:
      return winston.createLogger({
        format: ecsFormat({ convertReqRes: true }),
        transports: [
          new winston.transports.Console(),
          new winston.transports.File({
            filename: '/var/log/baby-book-api/logs/log.json',
            level: 'debug',
          }),
        ],
        defaultMeta,
      });

    default:
      return winston.createLogger({
        format: winston.format.combine(...commonFormats, winston.format.printf(printer)),
        transports: [
          new winston.transports.Console({
            level: process.env.LOG_LEVEL || getLevel(),
          }),
        ],
      });
  }
};

export const logger = createLoggerForEnv(env.environment);
