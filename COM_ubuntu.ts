import { SerialPort } from "serialport";
import { writeFile, readFile } from 'fs/promises';

import { TTask } from "./types";
import { arduinoPort } from ".";



let isRecording = false
let currentTaskIndex = 0;
let currentRoute: TTask[] = []
let currentRecordedRoute: TTask[] =[]

const getNextTask = (): string => {
  const task = currentRoute[currentTaskIndex]
  const formatted = `id:${task.id}, distance:${task.distance}, degree:${task.degree}, speed:${task.speed}, timeout:${task.timeout}`
  currentTaskIndex++;
  return formatted
};

export const sendTask = () => {
  if (currentRoute.length === currentTaskIndex) console.log('Маршрут завершен');
  else {
    const nextTask = getNextTask()
    console.log("Отправляю маршрут на Arduino", nextTask);
    arduinoPort.write(nextTask, (e) => {if(e)console.log('Ошибка отправки на Ардуино', e)});
  }
};

export const loadNextRoute = async() => {
  currentTaskIndex = 0
  const json = await readFile('./phone/pendingRoutes.json', 'utf8')
  const routes = JSON.parse(json)
  
  if(routes.length === 0) {
    currentRoute = []
    console.log('Маршрутов больше нет')
  }
  else {
    // TODO uncomment
    // currentRoute = routes.shift()
    currentRoute = routes[0]
    await writeFile('./phone/pendingRoutes.json', JSON.stringify(routes), 'utf8')
    console.log('Маршрут загружен');
    sendTask()
  }
};

export const recordTask = async (data: string) => {
  if (data==='start') isRecording = true
  else if (data==='end'){
    isRecording = false
    const json = await readFile('./phone/recordedRoutes.json', 'utf8')
    const recordedRoutes = JSON.parse(json)
    recordedRoutes.push(currentRecordedRoute)
    await writeFile('./phone/recordedRoutes.json', JSON.stringify(recordedRoutes))
    currentRecordedRoute = []
  }
  else {
    const values = data.split(', ').map(array=> array.split(':')[1])
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

export const toggleStart = () => {
  if (isRecording) return
  if (currentRoute.length === 0) {
    console.log('Загружается новый маршрут...')
    loadNextRoute()
  }
}