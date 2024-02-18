import shell from 'shelljs'
import { SerialPort } from 'serialport';
import { usb, getDeviceList } from 'usb';
import { ReadlineParser } from '@serialport/parser-readline'

import { recordTask, sendTask, toggleStart } from './COM_ubuntu';
import { mountPoint, onAttachAndroid, onDetachDevice } from './phone/phoneCommunicationsExist'

export const arduinoPath = "/dev/serial/by-id/usb-Arduino_Uno_Arduino_Uno_2017-2-25-if00"
export let arduinoPort = new SerialPort({
  path:arduinoPath,
  baudRate: 115200,
});

console.log('Ослик запущен...');

usb.on('attach', async (data)=> {
  const isArduino = data.deviceDescriptor.idVendor === 9025 && data.deviceDescriptor.idProduct === 67
  if(isArduino) setTimeout(() => arduinoPort.open(), 500);
  else onAttachAndroid()
})

arduinoPort.on("open", () => console.log("Порт arduino открыт\n\n"));

arduinoPort.on('error', function(err) {
  console.log('arduinoPort: ', err.message);
})

const parser = arduinoPort.pipe(new ReadlineParser())
parser.on("data", (data) => {
  const trimmed = data.trim()
  console.log('Ubuntu получил данные:', trimmed)

  if(trimmed === '[go]') toggleStart()
  else if(trimmed === '[r]') sendTask()
  else if(trimmed.includes('[w]')) recordTask(trimmed.split('[w]:')[1])
});

usb.on('detach', onDetachDevice)

process.on('unhandledRejection', (err) => { 
    // TODO uncomment
    shell.exec(`fusermount -u ${mountPoint}`)
    console.error('unhandledRejection',err);
    process.exit(1);
  })