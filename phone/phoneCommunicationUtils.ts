import {  writeFileSync, readdirSync, readFileSync, statSync} from 'fs';

import { basePath } from './phoneConstants'
import { IPhoneAppSettings } from './types'

let settingPathTimer: NodeJS.Timeout
let settingsTimer: NodeJS.Timeout

let isSafeRemove = false

let clientSettingsPath = ''
const cachedSettingsPath = './phone/cachedSettingsPath.json'
let clientSettings: IPhoneAppSettings | null = null

export const onAttachDevice = () => {
    setSettingsPath()
 
    settingsTimer = setInterval(async () => {        
        if(!clientSettingsPath) {
            console.log("Файл настроек не найден!");
            return;
        }
        else {            
            const settings = JSON.parse(readFileSync(clientSettingsPath, 'utf-8'))
            clientSettings = settings
            
            if (!clientSettings || isSafeRemove) return
            console.log('Слушаю настройки ', clientSettings);


            if (clientSettings.isSafeRemove) {
                isSafeRemove = true
                return
            }

            if (clientSettings.pendingRoutes.length!==0) {
                writeFileSync('./phone/pendingRoutes.json', JSON.stringify(clientSettings.pendingRoutes))
                clientSettings.pendingRoutes = []
            }

            const recordedRoutes =  JSON.parse(readFileSync('./phone/recordedRoutes.json', 'utf8'))
            if (recordedRoutes.length!==0) {
                clientSettings.recordedRoutes.push(recordedRoutes)
                writeFileSync('./phone/recordedRoutes.json', JSON.stringify([]))
            }

            clientSettings.isConnected=true
            
            writeFileSync(clientSettingsPath, JSON.stringify(clientSettings))
        }
    }, 1000);
}

const setSettingsPath = () => {
    settingPathTimer = setInterval(()=>{
        const files = readdirSync(basePath)
        console.log(files.length !== 0 ? 'Oslik увидел файловую систему телефона' : 'Oslik НЕ ВИДИТ файловую систему телефона');

        if (files.length !== 0) {
            clearInterval(settingPathTimer)

            console.log("Ищу путь к файлу настроек...");
            const cached = JSON.parse(readFileSync(cachedSettingsPath, 'utf8'))
            
            if(cached.path){
                clientSettingsPath = cached.path
                console.log('Путь к настройкам найден в кэше. ', clientSettingsPath);
            }
            else {
                console.log('Поиск пути к файлу настроек...');
                searchSettingsPath(basePath)
            }
        }
    }, 1000)
}  

export const searchSettingsPath = (path: string) => {
    if(clientSettingsPath) {
        console.log("Путь к настройкам уже найден, выхожу из поиска.", clientSettingsPath);
        return
    }

    const files = readdirSync(path)
    if(files.includes('OslikHodovaya.json')) {
        clientSettingsPath = path + '/OslikHodovaya.json'
        writeFileSync(cachedSettingsPath, JSON.stringify({path:clientSettingsPath}))
    }
    else files.forEach(file=>{
        console.log('Файл настроек в ' + path + ' не найден.')
        if(statSync(path + '/' + file).isDirectory()){ 
            searchSettingsPath(path + '/' + file)
            }
        }
    )
}

 export const onDetachDevice = () => {
    console.log('Телефон отключен');
    isSafeRemove = false
    clientSettingsPath = ''
    clientSettings = null
    clearInterval(settingPathTimer)
    clearInterval(settingsTimer)
}


