import { usb } from 'usb';
import shell from 'shelljs'
import { ReadlineParser } from '@serialport/parser-readline'

import { recordTask, sendTask, toggleStart, ubuntuPort } from './COM_ubuntu';
import { mountPoint, onAttachDevice, onDetachDevice } from './phone/phoneCommunicationsExist'

console.log('Ослик запущен...');

usb.on('attach', onAttachDevice)
usb.on('detach', onDetachDevice)

ubuntuPort.on("open", () => console.log("Порт ubuntu открыт\n\n"));

ubuntuPort.on('error', function(err) {
  console.log('ubuntuPort error: ', err.message);
})

const parser = ubuntuPort.pipe(new ReadlineParser())
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