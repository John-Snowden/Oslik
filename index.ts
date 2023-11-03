import { usb } from 'usb';

import { loadNextRoute, recordTask, sendTask, toggleStart, ubuntuPort } from './COM_ubuntu';
import { onAttachDevice, onDetachDevice } from './phone/phoneCommunicationUtils'

console.log('Ослик запущен...');

usb.on('attach', onAttachDevice)
usb.on('detach', onDetachDevice)

// Test
// arduinoPort.on("open", () => {
//   arduinoPort.write(JSON.stringify('Порт arduino открыт'))
// })
// arduinoPort.on('data', (data) => {
//   console.log('Arduino получил данные:', data.toString())
//   setTimeout(()=>arduinoPort.write(JSON.stringify('ok')), 1000)
//   }
// )

ubuntuPort.on("open", () => console.log("Порт ubuntu открыт"));
ubuntuPort.on("data", (data) => {
  const res = data.toString()
  console.log('Ubuntu получил данные', res)

  if(res.includes('[start]')) toggleStart()
  else if(res.includes('[r]')) sendTask()
  else if(res.includes('[w]')) recordTask(res.split('[w]:')[1])
  else console.log('Неизвестная команда от ардуино');
});

process.on('unhandledRejection', (err) => { 
    console.error('unhandledRejection',err);
    process.exit(1);
  })