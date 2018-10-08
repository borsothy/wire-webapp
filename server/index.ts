/*
 * Wire
 * Copyright (C) 2018 Wire Swiss GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see http://www.gnu.org/licenses/.
 *
 */

import config from './config';
import Server from './Server';
import {formatDate} from './timeUtil';

const server = new Server(config);

server
  .start()
  .then(port => console.info(`[${formatDate()}] Server is running on port ${port}.`))
  .catch(error => console.error(`[${formatDate()}] ${error.stack}`));

process.on('SIGINT', () => {
  console.log(`[${formatDate()}] Received "SIGINT" signal. Exiting.`);
  try {
    server.stop();
  } catch (error) {}
});

process.on('SIGTERM', () => {
  console.log(`[${formatDate()}] Received "SIGTERM" signal. Exiting.`);
  try {
    server.stop();
  } catch (error) {}
});

process.on('uncaughtException', error =>
  console.error(`[${formatDate()}] Uncaught exception: ${error.message}`, error)
);
process.on('unhandledRejection', error =>
  console.error(`[${formatDate()}] Uncaught rejection "${error.constructor.name}": ${error.message}`, error)
);
