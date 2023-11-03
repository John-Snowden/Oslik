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

let isActive = false
let isRecording = false
let currentTaskIndex = 0;
let currentRoute: TTask[] = []
let currentRecordedRoute: TTask[] =[]

const getNextTask = (): string => {
  const nextTask: TTask = currentRoute[currentTaskIndex];
  currentTaskIndex++;
  return JSON.stringify(nextTask);
};

export const sendTask = () => {
  if (currentRoute.length === currentTaskIndex) console.log('Маршрут завершен');
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

export const recordTask = (data:TTask | string) => {
  if ((data as string).includes('start')) isRecording = true
  else if ((data as string).includes('end')) {
    isRecording = false
    const recordedRoutes = JSON.parse(readFileSync('./phone/recordedRoutes.json', 'utf8'))
    recordedRoutes.push(currentRecordedRoute)
    writeFileSync('./phone/recordedRoutes.json', JSON.stringify(recordedRoutes))
    currentRecordedRoute = []
  }
  else currentRecordedRoute.push(data as TTask)
}

export const toggleStart = () => {
  if (currentRoute.length === 0) {
    console.log('Загружается новый маршрут...')
    isActive = true
    loadNextRoute()
  }
  else {
    isActive = !isActive
    if (isActive) getNextTask()
    else return
  }
}