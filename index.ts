import shell from 'shelljs'
import { SerialPort } from 'serialport';
import { usb, getDeviceList } from 'usb';
import { ReadlineParser } from '@serialport/parser-readline'

import { recordTask, sendTask, toggleStart } from './COM_ubuntu';
import { mountPoint, onAttachAndroid, onDetachDevice } from './phone/phoneCommunicationsExist'

export const arduinoPort = new SerialPort({
  path:"/dev/serial/by-id/usb-Arduino_Uno_Arduino_Uno_2017-2-25-if00",
  baudRate: 115200,
});

const devices = getDeviceList();

console.log('Ослик запущен...');

usb.on('attach', ()=> {
  const isArduino = devices.find(device => device.deviceDescriptor.idVendor === 9025)
 if(isArduino){
  console.log('isArduino', isArduino.deviceDescriptor.idVendor);
  console.log('isArduino', Boolean(isArduino));
 }
 else onAttachAndroid()
})
usb.on('detach', onDetachDevice)

arduinoPort.on("open", () => console.log("Порт arduino открыт\n\n"));

arduinoPort.on('error', function(err) {
  console.log('arduinoPort error: ', err.message);
})

const parser = arduinoPort.pipe(new ReadlineParser())
parser.on("data", (data) => {
  const trimmed = data.trim()
  console.log('Ubuntu получил данные:', trimmed)

  if(trimmed === '[go]') toggleStart()
  else if(trimmed === '[r]') sendTask()
  else if(trimmed.includes('[w]')) recordTask(trimmed.split('[w]:')[1])
});

process.on('unhandledRejection', (err) => { 
    // TODO uncomment
    shell.exec(`fusermount -u ${mountPoint}`)
    console.error('unhandledRejection',err);
    process.exit(1);
  })