import { usb } from 'usb';
import shell from 'shelljs'

import { recordTask, sendTask, start, ubuntuPort } from './COM_ubuntu';
import { mountPoint, onAttachDevice, onDetachDevice } from './phone/phoneCommunicationsExist'

console.log('Ослик запущен...');

usb.on('attach', onAttachDevice)
usb.on('detach', onDetachDevice)


ubuntuPort.on("open", () => console.log("Порт ubuntu открыт"));
ubuntuPort.on("data", (data) => {
  const res = data.toString()
  console.log('Ubuntu получил данные', res)

  if(res === '[power]') start()
  else if(res === '[r]') sendTask()
  else if(res.includes('[w]')) recordTask(res.split('[w]:')[1])
  else console.log('Неизвестная команда от ардуино');
});

process.on('unhandledRejection', (err) => { 
  // todo
    // shell.exec(`fusermount -u ${mountPoint}`)
    console.error('unhandledRejection',err);
    process.exit(1);
  })