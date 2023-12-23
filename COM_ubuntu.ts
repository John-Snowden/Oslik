import { SerialPort } from "serialport";
import { writeFileSync, readFileSync } from 'fs';

import { TTask } from "./types";

export const ubuntuPort = new SerialPort({
  path:"/dev/serial/by-id/usb-Arduino_Uno_Arduino_Uno_2017-2-25-if00",
  baudRate: 57600,
});

let isRecording = false
let currentTaskIndex = 0;
let currentRoute: TTask[] = []
let currentRecordedRoute: TTask[] =[]

const getNextTask = (): string => {
  currentTaskIndex++;
  const task = currentRoute[currentTaskIndex]
  const formatted = `id:${task.id},distance:${task.distance},degree:${task.degree},speed:${task.speed},timeout:${task.timeout}`
  return formatted
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

export const recordTask = (data: string) => {
  if (data==='start') isRecording = true
  else if (data==='end'){
    isRecording = false
    const recordedRoutes = JSON.parse(readFileSync('./phone/recordedRoutes.json', 'utf8'))
    recordedRoutes.push(currentRecordedRoute)
    writeFileSync('./phone/recordedRoutes.json', JSON.stringify(recordedRoutes))
    currentRecordedRoute = []
  }
  else {
    const values = data.split(',').map(array=> array.split(':')[1])
    const formatted:TTask = {
      id:values[0],
      distance:Number(values[1]),
      degree:Number(values[2]),
      speed:Number(values[3]),
      timeout:Number(values[4])
    }
    currentRecordedRoute.push(formatted)
  }
}

export const start = () => {
  if (isRecording) return
  if (currentRoute.length === 0) {
    console.log('Загружается новый маршрут...')
    loadNextRoute()
  }
  sendTask()
}