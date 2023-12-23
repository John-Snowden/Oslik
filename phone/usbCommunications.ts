
import { IPhoneAppSettings } from './types'
import { writeFileSync, readFileSync } from 'fs';
const drivelist = require('drivelist');
import shell from 'shelljs'

let clientSettingsPath = ''
let clientSettings: IPhoneAppSettings | null = null

let mountingCounter = 0

export const onAttachDevice = async () => {
    const mountingTimer = setInterval(()=>{
        if (clientSettingsPath) {
            clearInterval(mountingTimer)
            return
        }
        mount()
    },1000)
}

const mount = async () => {
    console.log('mounting attempt... ' + mountingCounter);
    const drives = await drivelist.list();
    console.log('drives: ', drives);
    
    drives.forEach((device: any) => {
        if (device.isUSB) {
            shell.exec(`mount ${device.device}1 /home/orangepi/Desktop/Oslik/media`)
            console.log('Usb подключен');
            clientSettingsPath = '/home/orangepi/Desktop/Oslik/media/oslik/OslikHodovaya.json'
            clientSettings = JSON.parse(readFileSync(clientSettingsPath, 'utf-8'))
            console.log('mounting succeeded in ' + mountingCounter + ' attempts')
            }
        }
    )

    if (!clientSettings) return
    console.log(clientSettings);
    

    if (clientSettings.pendingRoutes.length!==0) {
        writeFileSync('./phone/pendingRoutes.json', JSON.stringify(clientSettings.pendingRoutes))
        clientSettings.pendingRoutes = []
    }

    const recordedRoutes = JSON.parse(readFileSync('./phone/recordedRoutes.json', 'utf8'))
    if (recordedRoutes.length!==0) {
        clientSettings.recordedRoutes.push(recordedRoutes)
        writeFileSync('./phone/recordedRoutes.json', JSON.stringify([]))
    }

    writeFileSync('/home/orangepi/Desktop/Oslik/media/oslik/OslikHodovaya.json', JSON.stringify(clientSettings))
}

export const onDetachDevice = () => {
    shell.exec('umount /home/orangepi/Desktop/Oslik/media')
    console.log('Usb отключен');
    clientSettingsPath = ''
    clientSettings = null
}