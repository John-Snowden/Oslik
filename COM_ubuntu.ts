import { SerialPort } from "serialport";
import {  writeFileSync, readFileSync } from 'fs';

import { TTask } from "./types";

export const ubuntuPort = new SerialPort({
  path: "/dev/pts/4",
  baudRate: 57600,
});

// Test
// export const arduinoPort = new SerialPort({
//   path: "/dev/pts/5",
//   baudRate: 57600,
// });

let currentTaskIndex = 0;
let currentRoute: TTask[] = []

const getNextTask = (): string => {
  const nextTask: TTask = currentRoute[currentTaskIndex];
  currentTaskIndex++;
  return JSON.stringify(nextTask);
};

export const sendTask = () => {
  if (currentRoute.length === 0) console.log('Маршрут не загружен');
  else if (currentRoute.length === currentTaskIndex) console.log('Маршрут завершен');
  else ubuntuPort.write(getNextTask());
};

export const loadNextRoute = () => {
  currentTaskIndex = 0
  const routes = JSON.parse(readFileSync('./phone/pendingRoutes.json', 'utf8'))
  
  if(routes.length === 0) {
    currentRoute = []
    console.log('Маршрутов больше нет')
  }
  else {
    currentRoute = routes.shift()
    console.log('Маршрут загружен');
    writeFileSync('./phone/pendingRoutes.json', JSON.stringify(routes))
  }
};

